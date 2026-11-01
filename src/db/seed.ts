import { db } from './db';
import type { Book, Preset, Session, Settings } from './types';

interface SeedData {
  books: Book[];
  sessions: Session[];
  presets: Preset[];
  settings: Settings;
}

/** 개발용: docs/seed-data.json을 불러와 같은 ID는 덮어씁니다(다른 데이터는 그대로). */
export async function loadSeedData() {
  const seed = (await import('../../docs/seed-data.json')).default as unknown as SeedData;
  await db.transaction('rw', [db.books, db.sessions, db.presets, db.settings], async () => {
    await db.books.bulkPut(seed.books);
    await db.sessions.bulkPut(seed.sessions);
    await db.presets.bulkPut(seed.presets);
    await db.settings.put({ key: 'app', ...seed.settings });
  });
  return { books: seed.books.length, sessions: seed.sessions.length };
}
