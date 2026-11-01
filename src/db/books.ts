import { db } from './db';
import type { Book, BookStatus } from './types';
import { newId } from '../lib/id';

export interface NewBook {
  title: string;
  author: string;
  totalPages: number;
  coverBlob?: Blob;
}

export async function addBook(input: NewBook): Promise<string> {
  const book: Book = {
    id: newId('book'),
    ...input,
    status: 'reading',
    currentPage: 0,
    createdAt: new Date().toISOString(),
  };
  await db.books.add(book);
  return book.id;
}

export function setBookStatus(id: string, status: BookStatus) {
  return db.books.update(id, { status });
}
