import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Folder,
  FolderPlus,
  FileText,
  Upload,
  Download,
  Trash2,
  Loader2,
  X,
  Pencil,
  MoreVertical,
  ChevronRight,
  ExternalLink,
  Share2,
  Copy,
  Users,
  Lock,
  Link2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Swal from 'sweetalert2';
import {
  Folder as FolderType,
  Note,
  NoteStatus,
  SharedWithMeEntry,
  listFolders,
  createFolder,
  renameFolder,
  deleteFolder,
  listNotes,
  getNote,
  uploadNote,
  getNoteDownloadUrl,
  getNoteViewUrl,
  deleteNote,
  shareFolder,
  shareNote,
  listSharedWithMe,
  openShareLink,
} from '../../shared/notesApi';

function formatBytes(bytes: string | null): string {
  if (!bytes) return '—';
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const STATUS_STYLES: Record<NoteStatus, { label: string; className: string }> = {
  pending: { label: 'Processing…', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  ready: { label: 'Ready', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  failed: { label: 'Failed', className: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const PENDING_SHARE_KEY = 'pendingShareToken';

const swalToast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true,
});

function notifyError(message: string) {
  Swal.fire({ icon: 'error', title: 'Something went wrong', text: message, confirmButtonColor: '#10b981' });
}

function notifySuccess(message: string) {
  swalToast.fire({ icon: 'success', title: message });
}

async function confirmDelete(title: string, text: string): Promise<boolean> {
  const result = await Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Delete',
    confirmButtonColor: '#e11d48',
    cancelButtonColor: '#94a3b8',
  });
  return result.isConfirmed;
}

async function promptForName(title: string, currentValue: string): Promise<string | null> {
  const result = await Swal.fire({
    title,
    input: 'text',
    inputValue: currentValue,
    showCancelButton: true,
    confirmButtonText: 'Save',
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#94a3b8',
    inputValidator: (value) => (!value || !value.trim() ? 'A name is required' : undefined),
  });
  return result.isConfirmed ? (result.value as string).trim() : null;
}

interface BreadcrumbEntry {
  id: string | null;
  name: string;
}

type RowMenuTarget = { type: 'folder'; item: FolderType } | { type: 'note'; item: Note };
type ShareTarget = { type: 'folder'; item: FolderType } | { type: 'note'; item: Note };
type ViewMode = 'mine' | 'shared';

export default function NotesPage() {
  const [mode, setMode] = useState<ViewMode>('mine');
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbEntry[]>([{ id: null, name: 'Notes' }]);
  const currentFolderId = breadcrumb[breadcrumb.length - 1].id;
  const isSharedRoot = mode === 'shared' && currentFolderId === null;
  const readOnly = mode === 'shared';

  const [folders, setFolders] = useState<FolderType[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [sharedRootItems, setSharedRootItems] = useState<SharedWithMeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [rowMenu, setRowMenu] = useState<RowMenuTarget | null>(null);

  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null);
  const [shareRestricted, setShareRestricted] = useState(false);
  const [shareEmails, setShareEmails] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shareResultUrl, setShareResultUrl] = useState<string | null>(null);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerNote, setViewerNote] = useState<Note | null>(null);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerLoading, setViewerLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadContents = useCallback(async () => {
    setLoading(true);
    try {
      if (mode === 'shared' && currentFolderId === null) {
        const shared = await listSharedWithMe();
        setSharedRootItems(shared);
        setFolders([]);
        setNotes([]);
      } else {
        const [{ folders: folderList }, noteList] = await Promise.all([
          listFolders(currentFolderId),
          currentFolderId ? listNotes(currentFolderId) : Promise.resolve([]),
        ]);
        setFolders(folderList);
        setNotes(noteList);
        setSharedRootItems([]);
      }
    } catch {
      notifyError('Could not load this folder.');
    } finally {
      setLoading(false);
    }
  }, [mode, currentFolderId]);

  useEffect(() => {
    loadContents();
  }, [loadContents]);

  // Close any open row menu on an outside click.
  useEffect(() => {
    if (!rowMenu) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-row-menu]')) setRowMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [rowMenu]);

  const openViewer = useCallback(async (noteId: string) => {
    setViewerOpen(true);
    setViewerNote(null);
    setViewerUrl(null);
    setViewerLoading(true);
    try {
      const note = await getNote(noteId);
      if (note.status !== 'ready') {
        notifyError(note.status === 'failed' ? 'This note failed to process.' : 'This note is still processing.');
        setViewerOpen(false);
        return;
      }
      setViewerNote(note);
      const { url } = await getNoteViewUrl(noteId);
      setViewerUrl(url);
    } catch {
      notifyError('Could not open that note. You may no longer have access to it.');
      setViewerOpen(false);
    } finally {
      setViewerLoading(false);
    }
  }, []);

  // A link like ?shared=<token> (see App.tsx) drops its token in localStorage —
  // consume it once, on mount, whichever way the student reached the Notes tab.
  useEffect(() => {
    const token = localStorage.getItem(PENDING_SHARE_KEY);
    if (!token) return;
    localStorage.removeItem(PENDING_SHARE_KEY);
    (async () => {
      try {
        const opened = await openShareLink(token);
        notifySuccess(`"${opened.name}" added to Shared with me`);
        setMode('shared');
        if (opened.resource_type === 'folder') {
          setBreadcrumb([{ id: null, name: 'Shared with me' }, { id: opened.resource_id, name: opened.name }]);
        } else {
          setBreadcrumb([{ id: null, name: 'Shared with me' }]);
          openViewer(opened.resource_id);
        }
      } catch (err: any) {
        notifyError(
          err?.response?.data?.message || 'This share link is invalid, expired, or you do not have access to it.'
        );
      }
    })();
  }, [openViewer]);

  const handleSwitchMode = (m: ViewMode) => {
    if (m === mode) return;
    setMode(m);
    setBreadcrumb([{ id: null, name: m === 'mine' ? 'Notes' : 'Shared with me' }]);
  };

  const openFolder = (folderId: string, name: string) => {
    setBreadcrumb((prev) => [...prev, { id: folderId, name }]);
  };

  const goToBreadcrumb = (index: number) => {
    setBreadcrumb((prev) => prev.slice(0, index + 1));
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newFolderName.trim();
    if (!name || creatingFolder) return;
    setCreatingFolder(true);
    try {
      const folder = await createFolder(name, currentFolderId);
      setFolders((prev) => [...prev, folder].sort((a, b) => a.name.localeCompare(b.name)));
      setNewFolderName('');
      setNewFolderOpen(false);
      notifySuccess(`"${folder.name}" folder created`);
    } catch (err: any) {
      notifyError(err?.response?.data?.message || 'Could not create that folder.');
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleRenameFolder = async (folder: FolderType) => {
    setRowMenu(null);
    const name = await promptForName('Rename folder', folder.name);
    if (!name || name === folder.name) return;
    try {
      const updated = await renameFolder(folder.id, name);
      setFolders((prev) => prev.map((f) => (f.id === folder.id ? updated : f)));
      notifySuccess('Folder renamed');
    } catch {
      notifyError('Could not rename that folder.');
    }
  };

  const handleDeleteFolder = async (folder: FolderType) => {
    setRowMenu(null);
    const confirmed = await confirmDelete(`Delete "${folder.name}"?`, "This deletes everything inside it. This can't be undone.");
    if (!confirmed) return;
    try {
      await deleteFolder(folder.id);
      setFolders((prev) => prev.filter((f) => f.id !== folder.id));
      notifySuccess('Folder deleted');
    } catch {
      notifyError('Could not delete that folder.');
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || !files.length || !currentFolderId) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const note = await uploadNote(currentFolderId, file);
        setNotes((prev) => [note, ...prev]);
      }
      notifySuccess(files.length > 1 ? `${files.length} notes uploaded` : 'Note uploaded');
    } catch {
      notifyError('Could not upload that note. Please try again.');
      loadContents();
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownload = async (noteId: string) => {
    setRowMenu(null);
    try {
      const url = await getNoteDownloadUrl(noteId);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      notifyError('Could not get a download link for that note.');
    }
  };

  const handleDeleteNote = async (note: Note) => {
    setRowMenu(null);
    const confirmed = await confirmDelete(`Delete "${note.original_filename}"?`, "This can't be undone.");
    if (!confirmed) return;
    try {
      await deleteNote(note.id);
      setNotes((prev) => prev.filter((n) => n.id !== note.id));
      notifySuccess('Note deleted');
    } catch {
      notifyError('Could not delete that note.');
    }
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setViewerNote(null);
    setViewerUrl(null);
  };

  const openShareModal = (target: ShareTarget) => {
    setRowMenu(null);
    setShareTarget(target);
    setShareRestricted(false);
    setShareEmails('');
    setShareResultUrl(null);
  };

  const handleCreateShare = async () => {
    if (!shareTarget) return;
    const emails = shareRestricted
      ? shareEmails.split(',').map((e) => e.trim()).filter(Boolean)
      : [];
    if (shareRestricted && emails.length === 0) {
      notifyError('Add at least one email address, or switch to an open link.');
      return;
    }
    setSharing(true);
    try {
      const { url } =
        shareTarget.type === 'folder'
          ? await shareFolder(shareTarget.item.id, emails)
          : await shareNote(shareTarget.item.id, emails);
      setShareResultUrl(url);
    } catch {
      notifyError('Could not create a share link for that item.');
    } finally {
      setSharing(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareResultUrl) return;
    await navigator.clipboard.writeText(shareResultUrl);
    notifySuccess('Link copied');
  };

  const renderPreviewBody = () => {
    if (!viewerNote || !viewerUrl) return null;
    const contentType = viewerNote.content_type || '';
    if (contentType.startsWith('image/')) {
      return <img src={viewerUrl} alt={viewerNote.original_filename} className="max-w-full max-h-full mx-auto object-contain" />;
    }
    if (contentType === 'application/pdf') {
      return <iframe src={viewerUrl} title={viewerNote.original_filename} className="w-full h-full border-0" />;
    }
    // Word/PowerPoint/Excel/text and anything else Chrome can't render inline —
    // Google Docs Viewer can fetch and render it from any publicly-reachable URL,
    // which a signed GCS URL is for the duration of its expiry.
    return (
      <iframe
        src={`https://docs.google.com/viewer?url=${encodeURIComponent(viewerUrl)}&embedded=true`}
        title={viewerNote.original_filename}
        className="w-full h-full border-0"
      />
    );
  };

  const isEmpty = isSharedRoot
    ? sharedRootItems.length === 0
    : folders.length === 0 && notes.length === 0;

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* Mode toggle */}
      <div className="flex items-center gap-1 mb-4 p-1 rounded-xl bg-slate-100 w-fit">
        <button
          onClick={() => handleSwitchMode('mine')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            mode === 'mine' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Folder className="w-3.5 h-3.5" /> My Notes
        </button>
        <button
          onClick={() => handleSwitchMode('shared')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            mode === 'shared' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Shared with me
        </button>
      </div>

      {/* Breadcrumb + toolbar */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-1 text-sm min-w-0 flex-wrap">
          {breadcrumb.map((crumb, i) => (
            <React.Fragment key={crumb.id ?? 'root'}>
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
              <button
                onClick={() => goToBreadcrumb(i)}
                disabled={i === breadcrumb.length - 1}
                className={`px-1.5 py-1 rounded-lg truncate max-w-[220px] ${
                  i === breadcrumb.length - 1
                    ? 'font-bold text-slate-800 cursor-default'
                    : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-100 cursor-pointer'
                }`}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setNewFolderOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-emerald-300 transition-colors cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              New Folder
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!currentFolderId || uploading}
              title={!currentFolderId ? 'Open a folder first to upload notes into it' : undefined}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-sm shadow-emerald-500/20"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Uploading…' : 'Upload Note'}
            </button>
            <input ref={fileInputRef} type="file" multiple hidden onChange={(e) => handleUpload(e.target.files)} />
          </div>
        )}
      </div>

      {/* Content table */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-slate-300 rounded-2xl">
          {isSharedRoot ? (
            <>
              <Users className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-slate-600 font-medium">Nothing shared with you yet</p>
              <p className="text-sm text-slate-400 mt-1">Links your classmates share with you will show up here.</p>
            </>
          ) : (
            <>
              <Folder className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-slate-600 font-medium">This folder is empty</p>
              <p className="text-sm text-slate-400 mt-1">
                {currentFolderId ? 'Create a subfolder or upload a note to get started.' : 'Create a folder to get started.'}
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="grid grid-cols-[1fr_120px_90px_104px] gap-3 px-4 py-2.5 border-b border-slate-200 bg-slate-50 rounded-t-2xl text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            <span>Name</span>
            <span>{isSharedRoot ? 'Shared by' : 'Modified'}</span>
            <span>Size</span>
            <span />
          </div>

          {isSharedRoot &&
            sharedRootItems.map((item) => (
              <div
                key={item.share_id}
                onClick={() =>
                  item.resource_type === 'folder'
                    ? openFolder(item.resource_id, item.name)
                    : openViewer(item.resource_id)
                }
                className="grid grid-cols-[1fr_120px_90px_104px] gap-3 items-center px-4 py-3 border-b border-slate-100 last:border-0 last:rounded-b-2xl hover:bg-slate-50 cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.resource_type === 'folder' ? (
                    <Folder className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="text-sm font-medium text-slate-800 truncate">{item.name}</span>
                </div>
                <span className="text-xs text-slate-400 truncate">{item.owner_email || '—'}</span>
                <span className="text-xs text-slate-400">—</span>
                <span />
              </div>
            ))}

          {!isSharedRoot &&
            folders.map((folder) => (
              <div
                key={folder.id}
                onClick={() => openFolder(folder.id, folder.name)}
                className="relative grid grid-cols-[1fr_120px_90px_104px] gap-3 items-center px-4 py-3 border-b border-slate-100 last:border-0 last:rounded-b-2xl hover:bg-slate-50 cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Folder className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-800 truncate">{folder.name}</span>
                </div>
                <span className="text-xs text-slate-400">{timeAgo(folder.updated_at)}</span>
                <span className="text-xs text-slate-400">—</span>
                {readOnly ? (
                  <span />
                ) : (
                  <div className="flex items-center justify-end gap-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openShareModal({ type: 'folder', item: folder });
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-200/60 cursor-pointer"
                      title="Share"
                      aria-label="Share folder"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <div data-row-menu className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRowMenu(rowMenu?.type === 'folder' && rowMenu.item.id === folder.id ? null : { type: 'folder', item: folder });
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
                        data-open={rowMenu?.type === 'folder' && rowMenu.item.id === folder.id}
                        aria-label="Folder actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {rowMenu?.type === 'folder' && rowMenu.item.id === folder.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-full mt-1 w-40 rounded-xl bg-white border border-slate-200 shadow-xl p-1 z-30"
                        >
                          <button
                            onClick={() => handleRenameFolder(folder)}
                            className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-50 text-slate-600 cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Rename
                          </button>
                          <button
                            onClick={() => handleDeleteFolder(folder)}
                            className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

          {!isSharedRoot &&
            notes.map((note) => {
              const status = STATUS_STYLES[note.status];
              return (
                <div
                  key={note.id}
                  onClick={() => openViewer(note.id)}
                  className={`relative grid grid-cols-[1fr_120px_90px_104px] gap-3 items-center px-4 py-3 border-b border-slate-100 last:border-0 last:rounded-b-2xl hover:bg-slate-50 group ${
                    note.status === 'ready' ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-sm font-medium text-slate-800 truncate">{note.original_filename}</span>
                    {note.status !== 'ready' && (
                      <span className={`shrink-0 px-1.5 py-0.5 rounded-md border text-[10px] font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">{timeAgo(note.created_at)}</span>
                  <span className="text-xs text-slate-400">{formatBytes(note.file_size)}</span>
                  <div className="flex items-center justify-end gap-0.5">
                    {!readOnly && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openShareModal({ type: 'note', item: note });
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-200/60 cursor-pointer"
                        title="Share"
                        aria-label="Share note"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(note.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-200/60 cursor-pointer"
                      title="Download"
                      aria-label="Download note"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {!readOnly && (
                      <div data-row-menu className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRowMenu(rowMenu?.type === 'note' && rowMenu.item.id === note.id ? null : { type: 'note', item: note });
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
                          data-open={rowMenu?.type === 'note' && rowMenu.item.id === note.id}
                          aria-label="Note actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {rowMenu?.type === 'note' && rowMenu.item.id === note.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full mt-1 w-40 rounded-xl bg-white border border-slate-200 shadow-xl p-1 z-30"
                          >
                            <button
                              onClick={() => handleDeleteNote(note)}
                              className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* New folder modal */}
      <AnimatePresence>
        {newFolderOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/40 flex items-center justify-center p-4"
            onClick={() => setNewFolderOpen(false)}
          >
            <motion.form
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleCreateFolder}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            >
              <h3 className="text-lg font-bold text-slate-800 mb-1">New folder</h3>
              <p className="text-sm text-slate-500 mb-4">
                Creates a folder inside "{breadcrumb[breadcrumb.length - 1].name}".
              </p>
              <input
                autoFocus
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25"
              />
              <div className="flex items-center justify-end gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setNewFolderOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newFolderName.trim() || creatingFolder}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
                >
                  {creatingFolder ? 'Creating…' : 'Create'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share modal */}
      <AnimatePresence>
        {shareTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/40 flex items-center justify-center p-4"
            onClick={() => setShareTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            >
              <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-600" />
                Share "{shareTarget.type === 'folder' ? shareTarget.item.name : shareTarget.item.original_filename}"
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Anyone who opens the link needs their own Classmate AI account to view it — it's added straight to their "Shared with me".
              </p>

              {!shareResultUrl ? (
                <>
                  <div className="flex items-center gap-1 mb-3 p-1 rounded-xl bg-slate-100 w-fit">
                    <button
                      type="button"
                      onClick={() => setShareRestricted(false)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        !shareRestricted ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Link2 className="w-3.5 h-3.5" /> Anyone with the link
                    </button>
                    <button
                      type="button"
                      onClick={() => setShareRestricted(true)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        shareRestricted ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" /> Specific people
                    </button>
                  </div>

                  {shareRestricted && (
                    <input
                      autoFocus
                      type="text"
                      value={shareEmails}
                      onChange={(e) => setShareEmails(e.target.value)}
                      placeholder="friend@classmate.ai, another@classmate.ai"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm mb-4 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25"
                    />
                  )}

                  <div className="flex items-center justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setShareTarget(null)}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateShare}
                      disabled={sharing}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
                    >
                      {sharing ? 'Creating link…' : 'Create Link'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 mb-4">
                    <input readOnly value={shareResultUrl} className="flex-1 min-w-0 bg-transparent text-xs text-slate-600 outline-none" />
                    <button
                      onClick={handleCopyShareLink}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer shrink-0"
                      aria-label="Copy link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => setShareTarget(null)}
                    className="w-full px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                  >
                    Done
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note viewer modal */}
      <AnimatePresence>
        {viewerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 flex items-center justify-center p-4 sm:p-8"
            onClick={closeViewer}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full h-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-200 shrink-0">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-sm font-semibold text-slate-800 truncate">
                  {viewerNote?.original_filename ?? 'Loading…'}
                </span>
                <div className="ml-auto flex items-center gap-1">
                  {viewerNote && (
                    <button
                      onClick={() => handleDownload(viewerNote.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                      aria-label="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                  {viewerUrl && (
                    <a
                      href={viewerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                      aria-label="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={closeViewer}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-0 bg-slate-100 flex items-center justify-center overflow-auto">
                {viewerLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : renderPreviewBody()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
