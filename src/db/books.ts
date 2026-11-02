import { db } from './db';
import type { Book, BookStatus, Quote } from './types';
import { newId } from '../lib/id';
import { cleanQuote } from '../lib/quotes';

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

/** 책 속 한 문장 남기기 */
export async function addQuote(bookId: string, text: string, page?: number) {
  const quote: Quote = {
    id: newId('quote'),
    text: cleanQuote(text),
    ...(page !== undefined && { page }),
    createdAt: new Date().toISOString(),
  };
  await db.transaction('rw', db.books, async () => {
    const book = await db.books.get(bookId);
    if (book) await db.books.update(bookId, { quotes: [...(book.quotes ?? []), quote] });
  });
  return quote;
}

/** 책 속 한 문장 지우기 */
export async function removeQuote(bookId: string, quoteId: string) {
  await db.transaction('rw', db.books, async () => {
    const book = await db.books.get(bookId);
    if (book) {
      await db.books.update(bookId, {
        quotes: (book.quotes ?? []).filter((q) => q.id !== quoteId),
      });
    }
  });
}
