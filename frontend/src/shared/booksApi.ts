import axios from 'axios';
import notesApi from './notesApi';

export type BookStatus = 'pending' | 'ready' | 'failed';

export interface Book {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  added_by: string;
  bucket: string;
  object_name: string;
  original_filename: string;
  content_type: string | null;
  file_size: string | null;
  cover_object_name: string | null;
  cover_content_type: string | null;
  cover_url: string | null;
  is_published: boolean;
  status: BookStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

/** Regular users only ever see published, ready books; a super_admin sees everything. */
export async function listBooks(search = ''): Promise<Book[]> {
  const res = await notesApi.get<{ books: Book[] }>('/books', {
    params: search ? { search } : undefined,
  });
  return res.data.books;
}

/** Signed URL that renders inline in the browser — the "preview"/read-in-app flow. */
export async function getBookViewUrl(bookId: string): Promise<{ url: string; contentType: string | null }> {
  const res = await notesApi.get<{ url: string; content_type: string | null }>(`/books/${bookId}/view-url`);
  return { url: res.data.url, contentType: res.data.content_type };
}

export async function getBookDownloadUrl(bookId: string): Promise<string> {
  const res = await notesApi.get<{ url: string }>(`/books/${bookId}/download-url`);
  return res.data.url;
}

export async function updateBook(
  bookId: string,
  updates: { title?: string; author?: string; description?: string; isPublished?: boolean }
): Promise<Book> {
  const res = await notesApi.patch<{ book: Book }>(`/books/${bookId}`, updates);
  return res.data.book;
}

export async function deleteBook(bookId: string): Promise<void> {
  await notesApi.delete(`/books/${bookId}`);
}

/**
 * Adds a new book (super_admin only) via the same signed-URL flow notes use:
 *   1. Ask the backend for signed PUT URL(s) — creates the book row as "pending".
 *   2. PUT the book file (and optional cover image) straight to Cloud Storage
 *      with plain axios, not notesApi — GCS doesn't expect our Bearer header.
 *   3. Tell the backend the upload finished so it can verify + mark it ready.
 * If step 2 or 3 throws, the pending row already exists — mark it "failed"
 * instead of leaving it stuck forever.
 */
export async function addBook(params: {
  title: string;
  author?: string;
  description?: string;
  file: File;
  cover?: File | null;
}): Promise<Book> {
  const { title, author, description, file, cover } = params;
  const contentType = file.type || 'application/octet-stream';
  const coverContentType = cover?.type || 'image/jpeg';

  const signed = await notesApi.post<{
    book_id: string;
    upload_url: string;
    cover_upload_url: string | null;
  }>('/books/upload-url', {
    title,
    author,
    description,
    filename: file.name,
    content_type: contentType,
    cover_filename: cover?.name,
    cover_content_type: cover ? coverContentType : undefined,
  });

  const { book_id, upload_url, cover_upload_url } = signed.data;

  try {
    await axios.put(upload_url, file, { headers: { 'Content-Type': contentType } });
    if (cover && cover_upload_url) {
      await axios.put(cover_upload_url, cover, { headers: { 'Content-Type': coverContentType } });
    }
    const res = await notesApi.post<{ book: Book }>(`/books/${book_id}/complete`);
    return res.data.book;
  } catch (err) {
    await notesApi.post(`/books/${book_id}/fail`).catch(() => {});
    throw err;
  }
}
