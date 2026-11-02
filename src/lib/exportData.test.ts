import type { Book, Session } from '../db/types';
import { BACKUP_SCHEMA, exportFileName, parseBackup, readingLog, toLocalIso } from './exportData';

const book: Book = {
  id: 'book_01',
  title: '작별하지 않는다',
  author: '한강',
  totalPages: 320,
  status: 'reading',
  currentPage: 142,
  createdAt: '2026-10-01T00:00:00.000Z',
};

const session = (id: string, start: Date, pages: [number, number] | null): Session => ({
  id,
  bookId: 'book_01',
  startedAt: start.toISOString(),
  endedAt: new Date(start.getTime() + 50 * 60_000).toISOString(),
  focusSeconds: 3000,
  startPage: pages?.[0] ?? null,
  endPage: pages?.[1] ?? null,
  mode: 'pomodoro',
});

describe('toLocalIso', () => {
  it('기기 시간대를 붙인다', () => {
    const d = new Date(2026, 9, 29, 22, 0, 5);
    const iso = toLocalIso(d);
    expect(iso.startsWith('2026-10-29T22:00:05')).toBe(true);
    expect(iso).toMatch(/[+-]\d\d:\d\d$/);
    expect(new Date(iso).getTime()).toBe(d.getTime());
  });
});

describe('readingLog (PRD 8.3)', () => {
  it('형식과 필드가 PRD와 같다', () => {
    const log = readingLog(
      [book],
      [
        session('ses_b', new Date(2026, 9, 29, 21, 5), [120, 142]),
        session('ses_a', new Date(2026, 9, 28, 9, 0), null),
      ],
      new Date(2026, 9, 29, 22, 0),
    );
    expect(log.schema).toBe('reading-log/v1');
    expect(log.source).toBe('rainy-library');
    expect(log.books).toEqual([
      { id: 'book_01', title: '작별하지 않는다', author: '한강', totalPages: 320 },
    ]);
    expect(log.sessions.map((s) => s.id)).toEqual(['ses_a', 'ses_b']);
    expect(log.sessions[1]).toEqual({
      id: 'ses_b',
      bookId: 'book_01',
      date: '2026-10-29',
      minutes: 50,
      pages: 22,
      startPage: 120,
      endPage: 142,
    });
    expect(log.sessions[0].pages).toBeNull();
  });
});

describe('parseBackup', () => {
  const ok = {
    schema: BACKUP_SCHEMA,
    exportedAt: 'x',
    books: [{ ...book }],
    sessions: [session('ses_1', new Date(), null)],
    presets: [],
    settings: { focusMin: 25 },
  };
  it('올바른 백업은 그대로 돌려준다', () => {
    expect(parseBackup(JSON.stringify(ok)).books[0].title).toBe('작별하지 않는다');
  });
  it('JSON이 아니면', () => {
    expect(() => parseBackup('{')).toThrow('JSON 파일을 읽지 못했어요.');
  });
  it('다른 형식(연대기 파일 등)이면', () => {
    expect(() => parseBackup(JSON.stringify({ schema: 'reading-log/v1' }))).toThrow(
      '빗소리 서재 백업 파일이 아니에요.',
    );
  });
  it('목록이 빠졌거나 기록 형식이 틀리면', () => {
    expect(() => parseBackup(JSON.stringify({ ...ok, sessions: undefined }))).toThrow(
      '내용이 빠져',
    );
    expect(() => parseBackup(JSON.stringify({ ...ok, books: [{ id: 1 }] }))).toThrow('형식이');
  });
});

describe('exportFileName', () => {
  it('날짜가 붙은 파일 이름', () => {
    expect(exportFileName('독서기록', 'xlsx', new Date(2026, 10, 2))).toBe(
      '빗소리서재_독서기록_2026-11-02.xlsx',
    );
  });
});
