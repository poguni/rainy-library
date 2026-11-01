import Dexie, { type EntityTable } from 'dexie';
import type { Book, Preset, Session, SettingsRow, Track } from './types';

export const db = new Dexie('rainy-library') as Dexie & {
  books: EntityTable<Book, 'id'>;
  sessions: EntityTable<Session, 'id'>;
  presets: EntityTable<Preset, 'id'>;
  tracks: EntityTable<Track, 'id'>;
  settings: EntityTable<SettingsRow, 'key'>;
};

// 스키마를 바꿀 때는 version(2)를 새로 추가하고 upgrade()로 옮깁니다. 기존 데이터는 지우지 않습니다.
db.version(1).stores({
  books: 'id, status, createdAt',
  sessions: 'id, bookId, startedAt',
  presets: 'id',
  tracks: 'id, order',
  settings: 'key',
});
