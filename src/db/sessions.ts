import { db } from './db';
import type { Session } from './types';

/**
 * 세션을 저장하고, 끝 쪽수가 있으면 책의 현재 쪽수를 옮깁니다.
 * 끝 쪽수가 전체 쪽수에 닿으면 책을 '완독'으로 바꿉니다(B-05). 이번에 완독했으면 true.
 */
export async function saveSession(session: Session): Promise<boolean> {
  return db.transaction('rw', db.sessions, db.books, async () => {
    await db.sessions.add(session);
    if (session.endPage === null) return false;
    const book = await db.books.get(session.bookId);
    const finished =
      !!book && book.status !== 'finished' && session.endPage >= book.totalPages;
    await db.books.update(session.bookId, {
      currentPage: session.endPage,
      ...(finished ? { status: 'finished' as const } : {}),
    });
    return finished;
  });
}
