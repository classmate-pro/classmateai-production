// ─── Dashboard Tab: Books ──────────────────────────────────────────────────
// Read-only library grid for every signed-in user (cover preview + read/
// download), plus add/edit/publish/delete controls when isAdmin is true.
// Books live in notes-service's own `books` table and GCS `books/` prefix —
// entirely separate from a student's personal notes/folders.
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Plus, Search, Download, Eye, Pencil, Trash2, X, ImagePlus, UploadCloud } from 'lucide-react';
import { Book, listBooks, addBook, updateBook, deleteBook, getBookViewUrl, getBookDownloadUrl } from '../../shared/booksApi';

interface BooksTabProps {
  isAdmin: boolean;
}

export default function BooksTab({ isAdmin }: BooksTabProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const load = useCallback(async (term: string) => {
    setLoading(true);
    setError('');
    try {
      setBooks(await listBooks(term));
    } catch {
      setError('Could not load the book library. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load('');
  }, [load]);

  useEffect(() => {
    const t = setTimeout(() => load(search), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handlePreview = async (book: Book) => {
    setBusyId(book.id);
    try {
      const { url } = await getBookViewUrl(book.id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      triggerToast('Could not open that book.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDownload = async (book: Book) => {
    setBusyId(book.id);
    try {
      const url = await getBookDownloadUrl(book.id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      triggerToast('Could not download that book.');
    } finally {
      setBusyId(null);
    }
  };

  const handleTogglePublish = async (book: Book) => {
    setBusyId(book.id);
    try {
      const updated = await updateBook(book.id, { isPublished: !book.is_published });
      setBooks((prev) => prev.map((b) => (b.id === book.id ? updated : b)));
      triggerToast(updated.is_published ? 'Book published — visible to all users.' : 'Book unpublished.');
    } catch {
      triggerToast('Could not update that book.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (book: Book) => {
    if (!window.confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    setBusyId(book.id);
    try {
      await deleteBook(book.id);
      setBooks((prev) => prev.filter((b) => b.id !== book.id));
      triggerToast('Book deleted.');
    } catch {
      triggerToast('Could not delete that book.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-50 bg-emerald-600 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg text-[13px]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or author…"
            className="pl-8 pr-3 py-2 text-[13px] bg-white border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 w-64"
          />
        </div>
        {isAdmin && (
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Book
          </button>
        )}
      </div>

      {error && <p className="mb-4 text-[13px] text-rose-600">{error}</p>}

      {!loading && books.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400">
          <BookOpen className="w-8 h-8 mx-auto mb-3 text-slate-300" />
          No books {search ? 'match your search' : 'in the library yet'}.
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {books.map((book) => (
          <div
            key={book.id}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col group"
          >
            <div className="relative w-full aspect-[3/4] bg-slate-100 flex items-center justify-center overflow-hidden">
              {book.cover_url ? (
                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-10 h-10 text-slate-300" />
              )}
              {isAdmin && !book.is_published && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                  Unpublished
                </span>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  disabled={busyId === book.id}
                  onClick={() => handlePreview(book)}
                  title="Preview"
                  className="p-2 rounded-full bg-white/90 text-slate-700 hover:bg-white cursor-pointer disabled:opacity-50"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  disabled={busyId === book.id}
                  onClick={() => handleDownload(book)}
                  title="Download"
                  className="p-2 rounded-full bg-white/90 text-slate-700 hover:bg-white cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-3 flex flex-col gap-1 flex-1">
              <h3 className="text-[13px] font-semibold text-slate-800 leading-snug line-clamp-2">{book.title}</h3>
              {book.author && <p className="text-[11.5px] text-slate-500">{book.author}</p>}
              {book.description && (
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{book.description}</p>
              )}

              {isAdmin && (
                <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-slate-50">
                  <button
                    disabled={busyId === book.id}
                    onClick={() => setEditing(book)}
                    title="Edit"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer disabled:opacity-50"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={busyId === book.id}
                    onClick={() => handleTogglePublish(book)}
                    className={`text-[10.5px] font-semibold px-2 py-1 rounded-lg cursor-pointer disabled:opacity-50 ${
                      book.is_published ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    {book.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    disabled={busyId === book.id}
                    onClick={() => handleDelete(book)}
                    title="Delete"
                    className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isAdmin && addOpen && (
        <AddBookModal
          onClose={() => setAddOpen(false)}
          onAdded={(book) => {
            setBooks((prev) => [book, ...prev]);
            setAddOpen(false);
            triggerToast('Book added.');
          }}
        />
      )}

      {isAdmin && editing && (
        <EditBookModal
          book={editing}
          onClose={() => setEditing(null)}
          onSaved={(book) => {
            setBooks((prev) => prev.map((b) => (b.id === book.id ? book : b)));
            setEditing(null);
            triggerToast('Book updated.');
          }}
        />
      )}
    </div>
  );
}

/* ─── Add Book modal ────────────────────────────────────────────────────── */
function AddBookModal({ onClose, onAdded }: { onClose: () => void; onAdded: (book: Book) => void }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleCoverChange = (f: File | null) => {
    setCover(f);
    setCoverPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return f ? URL.createObjectURL(f) : null;
    });
  };

  const handleSubmit = async () => {
    setError('');
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!file) { setError('Please choose a book file to upload.'); return; }

    setSaving(true);
    try {
      const book = await addBook({ title: title.trim(), author: author.trim() || undefined, description: description.trim() || undefined, file, cover });
      onAdded(book);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message || e.message || 'Could not add that book.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-display font-semibold text-lg text-slate-800">Add Book</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {error && <p className="text-[12.5px] text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="w-24 h-32 shrink-0 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-emerald-400 transition-colors"
            >
              {coverPreview ? (
                <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
              ) : (
                <ImagePlus className="w-6 h-6 text-slate-300" />
              )}
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleCoverChange(e.target.files?.[0] ?? null)}
            />
            <div className="flex-1 flex flex-col gap-2.5">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title *"
                className="w-full rounded-lg px-3 py-2 text-[13px] bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25"
              />
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author"
                className="w-full rounded-lg px-3 py-2 text-[13px] bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25"
              />
            </div>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description…"
            rows={3}
            className="w-full rounded-lg px-3 py-2 text-[13px] bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 resize-none"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-slate-200 text-[13px] text-slate-500 hover:border-emerald-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            {file ? file.name : 'Choose book file (PDF, EPUB…) *'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 cursor-pointer flex items-center gap-2"
            >
              {saving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? 'Uploading…' : 'Add Book'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Edit Book modal (metadata only — no file replace) ─────────────────── */
function EditBookModal({ book, onClose, onSaved }: { book: Book; onClose: () => void; onSaved: (book: Book) => void }) {
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author ?? '');
  const [description, setDescription] = useState(book.description ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!title.trim()) { setError('Title is required.'); return; }
    setSaving(true);
    try {
      const updated = await updateBook(book.id, { title: title.trim(), author: author.trim(), description: description.trim() });
      onSaved(updated);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message || e.message || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-display font-semibold text-lg text-slate-800">Edit Book</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-3">
          {error && <p className="text-[12.5px] text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title *"
            className="w-full rounded-lg px-3 py-2 text-[13px] bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25"
          />
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author"
            className="w-full rounded-lg px-3 py-2 text-[13px] bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description…"
            rows={3}
            className="w-full rounded-lg px-3 py-2 text-[13px] bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 resize-none"
          />
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
