// 엑셀(xlsx) 시트에 넣을 표(TASKS.md 7단계 '엑셀 파일 규칙'). 순수 함수만 두고, 실제 파일은 exceljs가 만듭니다.
import type { Book, Session } from '../db/types';
import { bookTotals, progressPercent } from './books';
import { bookAverageSpeed, finishEstimate, sessionPages, sessionSpeed } from './reading';
import { dayKey } from './stats';

export type CellFormat = 'text' | 'int' | 'speed' | 'percent' | 'date' | 'time';
export type CellValue = string | number | Date | null;

export interface SheetTable {
  name: string;
  columns: { header: string; format: CellFormat; wrap?: boolean }[];
  rows: CellValue[][];
}

const STATUS = { reading: '읽는 중', finished: '완독', paused: '보류' } as const;
const MODE = { pomodoro: '뽀모도로', free: '자유' } as const;

/** 날짜·시각 칸에 보일 글자(열 폭 계산용) */
function shown(v: CellValue, format: CellFormat): string {
  if (v === null) return '';
  if (v instanceof Date) return format === 'time' ? '00:00' : dayKey(v);
  if (typeof v === 'number') {
    if (format === 'percent') return `${Math.round(v * 100)}%`;
    if (format === 'speed') return v.toFixed(2);
    return String(Math.round(v));
  }
  return v;
}

// 한글 자모, CJK 기호·한자, 한글 음절, 전각 문자
const WIDE: [number, number][] = [
  [0x1100, 0x11ff],
  [0x3000, 0x9fff],
  [0xac00, 0xd7af],
  [0xff00, 0xffef],
];
const isWide = (code: number) => WIDE.some(([a, b]) => code >= a && code <= b);

/** 글자 폭: 한글·한자 등 넓은 글자는 2, 나머지는 1 */
export function textWidth(text: string): number {
  let w = 0;
  for (const ch of text) w += isWide(ch.codePointAt(0) ?? 0) ? 2 : 1;
  return w;
}

export const MIN_WIDTH = 10;
export const MAX_WIDTH = 50;
const PADDING = 3;

/** 열 폭: 가장 긴 칸(머리글 포함) + 여유 3칸, 10~50 사이(사용자 요청: 넉넉하게) */
export function columnWidths(table: SheetTable): number[] {
  return table.columns.map((col, i) => {
    const longest = Math.max(
      textWidth(col.header),
      ...table.rows.map((r) => textWidth(shown(r[i], col.format))),
    );
    return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, longest + PADDING));
  });
}

/** 시트 1 "책 목록" */
export function booksTable(books: Book[], sessions: Session[], today: Date): SheetTable {
  const rows = [...books]
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
    .map((b): CellValue[] => {
      const totals = bookTotals(sessions, b.id);
      const est = finishEstimate(b, sessions, today);
      const finish =
        est.kind === 'ok' ? est.date : est.kind === 'done' ? '완독' : '기록이 더 필요해요';
      return [
        b.title,
        b.author || null,
        STATUS[b.status],
        b.totalPages,
        b.currentPage,
        progressPercent(b.currentPage, b.totalPages) / 100,
        Math.round(totals.focusSeconds / 60),
        totals.sessionCount,
        bookAverageSpeed(sessions, b.id),
        finish,
        new Date(b.createdAt),
      ];
    });
  return {
    name: '책 목록',
    columns: [
      { header: '제목', format: 'text', wrap: true },
      { header: '저자', format: 'text', wrap: true },
      { header: '상태', format: 'text' },
      { header: '전체 쪽수', format: 'int' },
      { header: '현재 쪽수', format: 'int' },
      { header: '진행률(%)', format: 'percent' },
      { header: '누적 독서 시간(분)', format: 'int' },
      { header: '세션 수', format: 'int' },
      { header: '평균 속도(쪽/분)', format: 'speed' },
      { header: '완독 예상일', format: 'date' },
      { header: '등록일', format: 'date' },
    ],
    rows,
  };
}

/** 시트 2 "독서 기록"(오래된 것부터) */
export function sessionsTable(books: Book[], sessions: Session[]): SheetTable {
  const title = new Map(books.map((b) => [b.id, b.title]));
  const rows = [...sessions]
    .sort((a, b) => (a.startedAt < b.startedAt ? -1 : 1))
    .map((s): CellValue[] => {
      const start = new Date(s.startedAt);
      return [
        new Date(start.getFullYear(), start.getMonth(), start.getDate()),
        start,
        new Date(s.endedAt),
        title.get(s.bookId) ?? '(지운 책)',
        s.startPage,
        s.endPage,
        sessionPages(s),
        Math.round(s.focusSeconds / 60),
        sessionSpeed(s),
        MODE[s.mode],
      ];
    });
  return {
    name: '독서 기록',
    columns: [
      { header: '날짜', format: 'date' },
      { header: '시작 시각', format: 'time' },
      { header: '끝난 시각', format: 'time' },
      { header: '책 제목', format: 'text', wrap: true },
      { header: '시작 쪽수', format: 'int' },
      { header: '끝 쪽수', format: 'int' },
      { header: '읽은 쪽수', format: 'int' },
      { header: '독서 시간(분)', format: 'int' },
      { header: '속도(쪽/분)', format: 'speed' },
      { header: '방식', format: 'text' },
    ],
    rows,
  };
}

/** 엑셀은 날짜를 시간대 없이 저장하므로, 기기 시각 그대로 보이게 UTC로 옮깁니다. */
export function toExcelDate(d: Date): Date {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
}
