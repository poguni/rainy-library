import type { Book, Session } from '../db/types';
import {
  booksTable,
  columnWidths,
  MAX_WIDTH,
  MIN_WIDTH,
  sessionsTable,
  textWidth,
  toExcelDate,
} from './xlsxTable';

const book: Book = {
  id: 'book_01',
  title: '아주 긴 제목을 가진 책이 여기에 있습니다 그리고 제목이 아주 길어서 오십 칸을 넘깁니다',
  author: '한강',
  totalPages: 200,
  status: 'reading',
  currentPage: 50,
  createdAt: new Date(2026, 9, 1).toISOString(),
};

const ses: Session = {
  id: 'ses_1',
  bookId: 'book_01',
  startedAt: new Date(2026, 9, 29, 21, 5).toISOString(),
  endedAt: new Date(2026, 9, 29, 21, 55).toISOString(),
  focusSeconds: 3000,
  startPage: 30,
  endPage: 50,
  mode: 'pomodoro',
};

describe('textWidth', () => {
  it('한글은 2칸, 영문·숫자는 1칸', () => {
    expect(textWidth('ab1')).toBe(3);
    expect(textWidth('한강')).toBe(4);
    expect(textWidth('책 a')).toBe(4);
  });
});

describe('columnWidths', () => {
  it('머리글·내용 중 긴 쪽 + 여유, 최소·최대 안에서', () => {
    const t = booksTable([book], [ses], new Date(2026, 9, 30));
    const w = columnWidths(t);
    expect(w).toHaveLength(t.columns.length);
    expect(w[0]).toBe(MAX_WIDTH); // 긴 제목은 50에서 멈추고 줄바꿈
    expect(w[2]).toBe(MIN_WIDTH); // '상태' 같은 짧은 칸도 10은 됨
    // '누적 독서 시간(분)' 머리글: 한글 6자(12) + 영문·기호 6 = 18, 여유 3 → 21
    expect(w[6]).toBe(21);
    // 날짜 칸은 'YYYY-MM-DD'(10) + 3 → 13 이상이라 잘리지 않음
    expect(w[10]).toBeGreaterThanOrEqual(13);
  });
});

describe('booksTable', () => {
  it('책 한 줄의 값', () => {
    const row = booksTable([book], [ses], new Date(2026, 9, 30)).rows[0];
    expect(row.slice(1, 9)).toEqual(['한강', '읽는 중', 200, 50, 0.25, 50, 1, 0.4]);
    expect(row[9]).toBe('기록이 더 필요해요');
    expect(row[10]).toBeInstanceOf(Date);
  });
});

describe('sessionsTable', () => {
  it('세션 한 줄의 값과 지운 책', () => {
    const t = sessionsTable([book], [ses, { ...ses, id: 'ses_2', bookId: 'gone' }]);
    expect(t.rows[0].slice(3)).toEqual([book.title, 30, 50, 20, 50, 0.4, '뽀모도로']);
    expect((t.rows[0][0] as Date).getHours()).toBe(0);
    expect(t.rows[1][3]).toBe('(지운 책)');
  });
});

describe('toExcelDate', () => {
  it('기기 시각 숫자를 UTC 숫자로 옮긴다', () => {
    const d = toExcelDate(new Date(2026, 9, 29, 21, 5));
    expect([d.getUTCHours(), d.getUTCMinutes(), d.getUTCDate()]).toEqual([21, 5, 29]);
  });
});
