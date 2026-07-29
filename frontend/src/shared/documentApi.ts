import axios from 'axios';
import { AUTH_BASE_URL } from './api';
import { emitSessionExpired } from './sessionExpired';

// Base URL for the Document AI service (upload, OCR/extraction, RAG chat, general chat)
const baseURL =
  import.meta.env.VITE_DOCUMENT_API_URL || 'https://ai-assistant-729310986605.us-central1.run.app';

const documentApi = axios.create({ baseURL });

// Reuse the same access token as the auth service — the Document AI service
// verifies it locally against the same shared JWT secret.
documentApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh access token on 401 (same flow as shared/api.ts) — the access
// token is short-lived (15m), so a long chat session would otherwise get
// permanently logged out the moment it expires instead of silently refreshing.
documentApi.interceptors.response.use(
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
        return documentApi(originalRequest);
      } catch {
        // Refresh failed — the session is genuinely expired. Clear it and
        // tell App.tsx to log the user out and show the login page.
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        emitSessionExpired();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default documentApi;

export type DocumentStatus =
  | 'pending'
  | 'extracting'
  | 'chunking'
  | 'embedding'
  | 'indexing'
  | 'ready'
  | 'failed';

export interface DocumentResponse {
  id: string;
  user_id: string | null;
  filename: string;
  original_filename: string;
  file_path: string;
  output_path: string | null;
  content_type: string | null;
  file_size: string | null;
  status: DocumentStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageResponse {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatSessionResponse {
  id: string;
  document_id: string | null;
  user_id: string | null;
  title: string | null;
  session_type: 'general' | 'document';
  created_at: string;
  updated_at: string;
  messages: ChatMessageResponse[];
}

export interface ChatSource {
  document_id: string;
  text: string;
  score: number;
  chunk_index: number;
}

/**
 * Uploads a document via the signed-URL flow:
 *   1. Ask the backend for a signed PUT URL (creates the Document row as "pending").
 *   2. PUT the file bytes straight to Cloud Storage with that URL — the file
 *      never passes through our API. Note: this uses plain `axios`, not the
 *      `documentApi` instance, so the Bearer token interceptor doesn't attach
 *      an Authorization header GCS isn't expecting.
 *   3. Tell the backend the upload finished so OCR/embedding can start.
 */
export async function uploadDocument(file: File): Promise<DocumentResponse> {
  const contentType = file.type || 'application/octet-stream';

  const signed = await documentApi.post<{
    document_id: string;
    upload_url: string;
    object_name: string;
    bucket: string;
  }>('/upload/signed-url', { filename: file.name, content_type: contentType });

  await axios.put(signed.data.upload_url, file, {
    headers: { 'Content-Type': contentType },
  });

  const res = await documentApi.post<DocumentResponse>(
    `/upload/${signed.data.document_id}/complete`
  );
  return res.data;
}

/**
 * Attaches an already-uploaded Note (from the Notes tab) to the AI Assistant
 * instead of a fresh local file. The file is already sitting in Cloud
 * Storage, so this skips the signed-URL PUT step entirely — the backend
 * verifies ownership by looking the note up in notes-service itself.
 */
export async function ingestNote(noteId: string): Promise<DocumentResponse> {
  const res = await documentApi.post<DocumentResponse>('/upload/from-note', { note_id: noteId });
  return res.data;
}

export async function getDocument(documentId: string): Promise<DocumentResponse> {
  const res = await documentApi.get<DocumentResponse>(`/documents/${documentId}`);
  return res.data;
}

/** Signed GET URL for the original uploaded file. */
export async function getDocumentDownloadUrl(documentId: string): Promise<string> {
  const res = await documentApi.get<{ url: string }>(`/documents/${documentId}/download-url`);
  return res.data.url;
}

/** Signed GET URL for the extracted/processed text (only once status is "ready"). */
export async function getDocumentOutputUrl(documentId: string): Promise<string> {
  const res = await documentApi.get<{ url: string }>(`/documents/${documentId}/output-url`);
  return res.data.url;
}

export async function createChatSession(documentId?: string | null): Promise<ChatSessionResponse> {
  const res = await documentApi.post<ChatSessionResponse>('/chat/sessions', {
    document_id: documentId ?? null,
    session_type: documentId ? 'document' : 'general',
  });
  return res.data;
}

export async function sendGeneralMessage(
  question: string,
  sessionId?: string | null
): Promise<{ answer: string; session_id: string; title: string }> {
  const res = await documentApi.post('/chat/general', {
    question,
    session_id: sessionId ?? null,
  });
  return res.data;
}

export async function sendSessionMessage(
  sessionId: string,
  question: string
): Promise<{ answer: string; session_id: string; sources: ChatSource[] }> {
  const res = await documentApi.post(`/chat/sessions/${sessionId}`, { question });
  return res.data;
}

/** List the caller's chat sessions (newest first), for a Claude-style history sidebar. */
export async function listChatSessions(): Promise<ChatSessionResponse[]> {
  const res = await documentApi.get<ChatSessionResponse[]>('/chat/sessions');
  return res.data;
}

/** Fetch a single session with its full message history (to resume it). */
export async function getChatSession(sessionId: string): Promise<ChatSessionResponse> {
  const res = await documentApi.get<ChatSessionResponse>(`/chat/sessions/${sessionId}`);
  return res.data;
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  await documentApi.delete(`/chat/sessions/${sessionId}`);
}

const TERMINAL_STATUSES: DocumentStatus[] = ['ready', 'failed'];

/**
 * Poll a freshly-uploaded document until ingestion reaches a terminal state
 * (`ready` or `failed`). Pass `onStatus` to get a live callback on every
 * intermediate stage (`extracting` -> `chunking` -> `embedding` -> `indexing`)
 * for a real-time processing indicator.
 */
export async function waitForDocumentReady(
  documentId: string,
  {
    intervalMs = 1200,
    timeoutMs = 120000,
    onStatus,
  }: { intervalMs?: number; timeoutMs?: number; onStatus?: (doc: DocumentResponse) => void } = {}
): Promise<DocumentResponse> {
  const start = Date.now();
  while (true) {
    const doc = await getDocument(documentId);
    onStatus?.(doc);
    if (TERMINAL_STATUSES.includes(doc.status)) return doc;
    if (Date.now() - start > timeoutMs) {
      throw new Error('Document processing timed out.');
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}
