import axios from 'axios';
import { AUTH_BASE_URL } from './api';
import { emitSessionExpired } from './sessionExpired';

// Base URL for the Notes service (folder tree + note upload/fetch)
const baseURL =
  import.meta.env.VITE_NOTES_API_URL || 'https://notes-service-729310986605.us-central1.run.app/api/notes';

const notesApi = axios.create({ baseURL });

// Reuse the same access token as the auth service — notes-service verifies
// it locally against the same shared JWT secret.
notesApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh access token on 401 (same flow as shared/api.ts and documentApi.ts)
notesApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          `${AUTH_BASE_URL}/refresh`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = res.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return notesApi(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        emitSessionExpired();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default notesApi;

export type NoteStatus = 'pending' | 'ready' | 'failed';

export interface Folder {
  id: string;
  user_id: string;
  parent_id: string | null;
  name: string;
  folder_count: number;
  note_count: number;
  created_at: string;
  updated_at: string;
}

export type ShareResourceType = 'folder' | 'note';

export interface ShareInfo {
  id: string;
  resource_type: ShareResourceType;
  resource_id: string;
  owner_email: string | null;
  restricted: boolean;
  share_token: string;
  created_at: string;
  name: string;
  url: string;
}

export interface SharedWithMeEntry {
  share_id: string;
  resource_type: ShareResourceType;
  resource_id: string;
  owner_email: string | null;
  name: string;
  added_at: string;
}

export interface OpenedShare {
  id: string;
  resource_type: ShareResourceType;
  resource_id: string;
  owner_email: string | null;
  name: string;
}

export interface FolderPathEntry {
  id: string;
  name: string;
  parent_id: string | null;
}

export interface Note {
  id: string;
  folder_id: string;
  user_id: string;
  title: string;
  original_filename: string;
  bucket: string;
  object_name: string;
  content_type: string | null;
  file_size: string | null;
  status: NoteStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

/* ─── Folders (Drive-style tree) ─────────────────────────────────────────── */

/**
 * List the immediate children of a folder. Pass null/omit for top-level folders.
 * `readOnly` is true when `parentId` is a folder shared with (not owned by) the caller.
 */
export async function listFolders(parentId?: string | null): Promise<{ folders: Folder[]; readOnly: boolean }> {
  const res = await notesApi.get<{ folders: Folder[]; read_only: boolean }>('/folders', {
    params: parentId ? { parent_id: parentId } : undefined,
  });
  return { folders: res.data.folders, readOnly: res.data.read_only };
}

export async function createFolder(name: string, parentId?: string | null): Promise<Folder> {
  const res = await notesApi.post<{ folder: Folder }>('/folders', {
    name,
    parent_id: parentId ?? null,
  });
  return res.data.folder;
}

export async function renameFolder(folderId: string, name: string): Promise<Folder> {
  const res = await notesApi.patch<{ folder: Folder }>(`/folders/${folderId}`, { name });
  return res.data.folder;
}

export async function deleteFolder(folderId: string): Promise<void> {
  await notesApi.delete(`/folders/${folderId}`);
}

/** Breadcrumb ancestors from root to this folder (inclusive). */
export async function getFolderPath(folderId: string): Promise<FolderPathEntry[]> {
  const res = await notesApi.get<{ path: FolderPathEntry[] }>(`/folders/${folderId}/path`);
  return res.data.path;
}

/* ─── Notes ──────────────────────────────────────────────────────────────── */

export async function listNotes(folderId: string): Promise<Note[]> {
  const res = await notesApi.get<{ notes: Note[] }>(`/folders/${folderId}/notes`);
  return res.data.notes;
}

export async function listAllNotes(): Promise<Note[]> {
  const res = await notesApi.get<{ notes: Note[] }>('/');
  return res.data.notes;
}

export async function getNote(noteId: string): Promise<Note> {
  const res = await notesApi.get<{ note: Note }>(`/${noteId}`);
  return res.data.note;
}

/** Signed URL that forces a "Save As" download with the note's original filename. */
export async function getNoteDownloadUrl(noteId: string): Promise<string> {
  const res = await notesApi.get<{ url: string }>(`/${noteId}/download-url`);
  return res.data.url;
}

/** Signed URL that renders inline in the browser — used for the in-app preview. */
export async function getNoteViewUrl(noteId: string): Promise<{ url: string; contentType: string | null }> {
  const res = await notesApi.get<{ url: string; content_type: string | null }>(`/${noteId}/view-url`);
  return { url: res.data.url, contentType: res.data.content_type };
}

export async function deleteNote(noteId: string): Promise<void> {
  await notesApi.delete(`/${noteId}`);
}

/* ─── Sharing ────────────────────────────────────────────────────────────── */

/**
 * Share a folder or note. Omit `emails` (or pass an empty array) for an open
 * link anyone with a Classmate AI account can open; pass emails to restrict
 * it to just those people.
 */
export async function shareFolder(folderId: string, emails?: string[]): Promise<{ url: string }> {
  const res = await notesApi.post<{ url: string }>(`/folders/${folderId}/share`, { emails });
  return { url: res.data.url };
}

export async function shareNote(noteId: string, emails?: string[]): Promise<{ url: string }> {
  const res = await notesApi.post<{ url: string }>(`/${noteId}/share`, { emails });
  return { url: res.data.url };
}

/**
 * Opens a share link's token: requires the caller to be logged in (a user
 * with no Classmate AI account can never reach this — the request 401s
 * before it gets here), and records them as a recipient so it now appears
 * in their "Shared with me" list.
 */
export async function openShareLink(token: string): Promise<OpenedShare> {
  const res = await notesApi.get<{ share: OpenedShare }>(`/shares/${token}`);
  return res.data.share;
}

export async function listSharedWithMe(): Promise<SharedWithMeEntry[]> {
  const res = await notesApi.get<{ shared: SharedWithMeEntry[] }>('/shares/shared-with-me');
  return res.data.shared;
}

/** Shares the caller has created themselves (for managing/revoking outgoing shares). */
export async function listMyShares(): Promise<ShareInfo[]> {
  const res = await notesApi.get<{ shares: ShareInfo[] }>('/shares/mine');
  return res.data.shares;
}

export async function revokeShare(shareId: string): Promise<void> {
  await notesApi.delete(`/shares/${shareId}`);
}

/**
 * Uploads a note into a folder via the signed-URL flow:
 *   1. Ask the backend for a signed PUT URL (creates the note row as "pending").
 *   2. PUT the file bytes straight to Cloud Storage with that URL — the file
 *      never passes through our API. Uses plain `axios`, not `notesApi`, so
 *      the Bearer token interceptor doesn't attach a header GCS isn't expecting.
 *   3. Tell the backend the upload finished so it can verify + mark it ready.
 *
 * If step 2 or 3 throws, the pending row already exists — mark it "failed"
 * instead of leaving it stuck showing "Processing…" forever.
 */
export async function uploadNote(folderId: string, file: File): Promise<Note> {
  const contentType = file.type || 'application/octet-stream';

  const signed = await notesApi.post<{
    note_id: string;
    upload_url: string;
    object_name: string;
    bucket: string;
  }>(`/folders/${folderId}/notes/upload-url`, {
    filename: file.name,
    content_type: contentType,
  });

  try {
    await axios.put(signed.data.upload_url, file, {
      headers: { 'Content-Type': contentType },
    });
    const res = await notesApi.post<{ note: Note }>(`/${signed.data.note_id}/complete`);
    return res.data.note;
  } catch (err) {
    await notesApi.post(`/${signed.data.note_id}/fail`).catch(() => {});
    throw err;
  }
}
