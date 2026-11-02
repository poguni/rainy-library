// 내보내기 형식(순수 함수). 파일 저장·Blob 변환은 features/stats/exporters.ts가 맡습니다.
import type { Book, Preset, Session, Settings } from '../db/types';
import { sessionPages } from './reading';
import { dayKey } from './stats';

const pad = (n: number) => String(n).padStart(2, '0');

/** 기기 시간대가 붙은 ISO 시각: 2026-10-29T22:00:00+09:00 */
export function toLocalIso(d: Date): string {
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const abs = Math.abs(off);
  return (
    `${dayKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  );
}

/** 4-1 독서 연대기 연동 형식(PRD 8.3, C-01) */
export function readingLog(books: Book[], sessions: Session[], now: Date) {
  return {
    schema: 'reading-log/v1' as const,
    source: 'rainy-library' as const,
    exportedAt: toLocalIso(now),
    books: books.map(({ id, title, author, totalPages }) => ({ id, title, author, totalPages })),
    sessions: [...sessions]
      .sort((a, b) => (a.startedAt < b.startedAt ? -1 : 1))
      .map((s) => ({
        id: s.id,
        bookId: s.bookId,
        date: dayKey(new Date(s.startedAt)),
        minutes: Math.round(s.focusSeconds / 60),
        pages: sessionPages(s),
        startPage: s.startPage,
        endPage: s.endPage,
      })),
  };
}

export const BACKUP_SCHEMA = 'rainy-library-backup/v1';

/**
 * 백업 안의 표지. ZIP 백업은 file(ZIP 안의 경로), 예전 JSON 백업은 base64로 들어 있습니다.
 * 표지 없는 '기록만 백업'에는 cover가 없습니다.
 */
export interface BackupCover {
  type: string;
  file?: string;
  base64?: string;
}

/** ZIP 백업 안의 데이터 파일 이름 */
export const BACKUP_JSON = 'backup.json';

const COVER_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/heic': 'heic',
};

/** ZIP 백업 안의 표지 경로: covers/book_abc.jpg */
export function coverFileName(bookId: string, type: string): string {
  return `covers/${bookId}.${COVER_EXT[type] ?? 'img'}`;
}

/**
 * ZIP 안에서 backup.json을 찾아 그 폴더 경로를 돌려줍니다.
 * 사용자가 압축을 풀었다가 폴더째 다시 묶어도('폴더/backup.json') 찾을 수 있게 합니다.
 */
export function backupRoot(names: string[]): string | undefined {
  const hit = names
    .filter((n) => n === BACKUP_JSON || n.endsWith(`/${BACKUP_JSON}`))
    .sort((x, y) => x.length - y.length)[0];
  return hit?.slice(0, -BACKUP_JSON.length);
}

export type BackupBook = Omit<Book, 'coverBlob'> & { cover?: BackupCover };

export interface Backup {
  schema: typeof BACKUP_SCHEMA;
  exportedAt: string;
  books: BackupBook[];
  sessions: Session[];
  presets: Preset[];
  settings: Partial<Settings>;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

/** 백업 파일 내용을 확인합니다. 형식이 다르면 화면에 보여 줄 문장으로 오류를 냅니다. */
export function parseBackup(text: string): Backup {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('JSON 파일을 읽지 못했어요.');
  }
  if (!isObj(data) || data.schema !== BACKUP_SCHEMA) {
    throw new Error('빗소리 서재 백업 파일이 아니에요.');
  }
  const lists = ['books', 'sessions', 'presets'] as const;
  if (!lists.every((k) => Array.isArray(data[k])) || !isObj(data.settings)) {
    throw new Error('백업 파일의 내용이 빠져 있어요.');
  }
  const books = data.books as unknown[];
  const sessions = data.sessions as unknown[];
  const okBook = (b: unknown) =>
    isObj(b) && typeof b.id === 'string' && typeof b.title === 'string';
  const okSession = (s: unknown) =>
    isObj(s) && typeof s.id === 'string' && typeof s.bookId === 'string';
  if (!books.every(okBook) || !sessions.every(okSession)) {
    throw new Error('백업 파일의 기록 형식이 맞지 않아요.');
  }
  return data as unknown as Backup;
}

/** 내보내는 파일 이름: 빗소리서재_독서기록_2026-11-02.xlsx */
export function exportFileName(kind: string, ext: string, now: Date): string {
  return `빗소리서재_${kind}_${dayKey(now)}.${ext}`;
}
