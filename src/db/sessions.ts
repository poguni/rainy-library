import { db } from './db';
import type { Session } from './types';

/** 세션을 저장하고, 끝 쪽수가 있으면 책의 현재 쪽수를 옮깁니다. */
export async function saveSession(session: Session) {
  await db.transaction('rw', db.sessions, db.books, async () => {
    await db.sessions.add(session);
    if (session.endPage !== null) {
      await db.books.update(session.bookId, { currentPage: session.endPage });
    }
  });
}
