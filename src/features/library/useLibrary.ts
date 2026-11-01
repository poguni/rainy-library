import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db } from '../../db/db';
import { addBook, setBookStatus, type NewBook } from '../../db/books';
import { useLiveQuery } from '../../db/useLiveQuery';
import type { BookStatus } from '../../db/types';
import { bookTotals } from '../../lib/books';

export const STATUS_LABEL: Record<BookStatus, string> = {
  reading: '읽는 중',
  finished: '완독',
  paused: '보류',
};
export const STATUSES: BookStatus[] = ['reading', 'finished', 'paused'];

/** 서재 화면의 데이터와 동작. 필터와 선택한 책은 주소(?status=&book=)에 둡니다. */
export function useLibrary() {
  const [params, setParams] = useSearchParams();
  const books = useLiveQuery(() => db.books.orderBy('createdAt').toArray(), []);
  const sessions = useLiveQuery(() => db.sessions.toArray(), []);

  const status = (STATUSES as string[]).includes(params.get('status') ?? '')
    ? (params.get('status') as BookStatus)
    : 'reading';

  const counts = useMemo(() => {
    const c: Record<BookStatus, number> = { reading: 0, finished: 0, paused: 0 };
    books?.forEach((b) => (c[b.status] += 1));
    return c;
  }, [books]);

  const shelf = useMemo(() => books?.filter((b) => b.status === status) ?? [], [books, status]);
  const selected = shelf.find((b) => b.id === params.get('book')) ?? shelf[0];
  const totals = selected && sessions ? bookTotals(sessions, selected.id) : undefined;

  const update = (next: { status?: BookStatus; book?: string }) =>
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (next.status) p.set('status', next.status);
        if (next.book) p.set('book', next.book);
        else if (next.status) p.delete('book');
        return p;
      },
      { replace: true },
    );

  return {
    loading: books === undefined,
    status,
    counts,
    shelf,
    selected,
    totals,
    setFilter: (s: BookStatus) => update({ status: s }),
    select: (id: string) => update({ book: id }),
    add: async (input: NewBook) => update({ status: 'reading', book: await addBook(input) }),
    changeStatus: async (id: string, s: BookStatus) => {
      await setBookStatus(id, s);
      update({ status: s, book: id });
    },
  };
}
