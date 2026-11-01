import { checkEndPage, checkStartPage, defaultStartPage } from './pages';
import type { Book, Session } from '../db/types';

const book: Book = {
  id: 'book_a',
  title: 'A',
  author: '',
  totalPages: 248,
  status: 'reading',
  currentPage: 0,
  createdAt: '',
};
const ses = (endedAt: string, endPage: number | null, bookId = 'book_a'): Session => ({
  id: `ses_${endedAt}`,
  bookId,
  startedAt: endedAt,
  endedAt,
  focusSeconds: 600,
  startPage: 1,
  endPage,
  mode: 'free',
});

describe('defaultStartPage', () => {
  it('처음 읽는 책은 1쪽', () => expect(defaultStartPage(book, [])).toBe(1));
  it('현재 쪽수가 있으면 그 쪽', () =>
    expect(defaultStartPage({ ...book, currentPage: 64 }, [])).toBe(64));
  it('가장 최근 세션의 끝 쪽수(쪽수 없는 세션과 다른 책은 무시)', () => {
    const list = [
      ses('2026-10-29T21:55:00+09:00', 120),
      ses('2026-10-31T21:55:00+09:00', 142),
      ses('2026-11-01T21:00:00+09:00', null),
      ses('2026-11-02T21:00:00+09:00', 10, 'book_b'),
    ];
    expect(defaultStartPage(book, list)).toBe(142);
  });
});

describe('checkStartPage', () => {
  it('정상', () => expect(checkStartPage(120, 248)).toBeNull());
  it('0쪽 이하나 숫자가 아니면 경고', () => {
    expect(checkStartPage(0, 248)).toBe('invalid');
    expect(checkStartPage(NaN, 248)).toBe('invalid');
  });
  it('전체 쪽수보다 크면 경고', () => expect(checkStartPage(249, 248)).toBe('over-total'));
});

describe('checkEndPage', () => {
  it('정상', () => expect(checkEndPage(120, 142, 248)).toBeNull());
  it('시작 쪽수와 같아도 된다', () => expect(checkEndPage(120, 120, 248)).toBeNull());
  it('시작 쪽수보다 작으면 경고', () => expect(checkEndPage(120, 119, 248)).toBe('below-start'));
  it('전체 쪽수보다 크면 경고', () => expect(checkEndPage(120, 249, 248)).toBe('over-total'));
  it('숫자가 아니면 경고', () => expect(checkEndPage(120, NaN, 248)).toBe('invalid'));
});
