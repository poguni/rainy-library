import { db } from '../../db/db';
import { getSettings, updateSettings } from '../../db/settings';
import { useLiveQuery } from '../../db/useLiveQuery';
import { pickCurrentBook } from '../../lib/books';
import { defaultStartPage } from '../../lib/pages';

/** 타이머 홈에서 쓰는 책·설정 데이터 */
export function useCurrentBook(activeBookId?: string) {
  const books = useLiveQuery(() => db.books.toArray(), []);
  const sessions = useLiveQuery(() => db.sessions.toArray(), []);
  const settings = useLiveQuery(getSettings, []);

  const reading = (books ?? []).filter((b) => b.status === 'reading');
  // 세션 중이면 그 세션의 책(상태가 바뀌었어도)을 보여 줍니다.
  const book = activeBookId
    ? books?.find((b) => b.id === activeBookId)
    : pickCurrentBook(books ?? [], sessions ?? [], settings?.currentBookId);

  return {
    loading: !books || !sessions || !settings,
    settings,
    books: books ?? [],
    book,
    reading,
    suggestedStartPage: book ? defaultStartPage(book, sessions ?? []) : undefined,
    choose: (id: string) => updateSettings({ currentBookId: id }),
  };
}
