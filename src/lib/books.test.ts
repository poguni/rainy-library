import { bookTotals, progressPercent, spineLook } from './books';
import type { Session } from '../db/types';

const ses = (bookId: string, focusSeconds: number): Session => ({
  id: `ses_${Math.random()}`,
  bookId,
  startedAt: '',
  endedAt: '',
  focusSeconds,
  startPage: null,
  endPage: null,
  mode: 'free',
});

describe('progressPercent', () => {
  it('시안 예: 142 / 248쪽 → 57%', () => expect(progressPercent(142, 248)).toBe(57));
  it('0~100 사이로 자른다', () => {
    expect(progressPercent(300, 248)).toBe(100);
    expect(progressPercent(-5, 248)).toBe(0);
  });
  it('전체 쪽수가 0이면 0', () => expect(progressPercent(10, 0)).toBe(0));
});

describe('bookTotals', () => {
  it('해당 책의 세션만 더한다', () => {
    const list = [ses('a', 1800), ses('b', 900), ses('a', 3000)];
    expect(bookTotals(list, 'a')).toEqual({ focusSeconds: 4800, sessionCount: 2 });
    expect(bookTotals(list, 'c')).toEqual({ focusSeconds: 0, sessionCount: 0 });
  });
});

describe('spineLook', () => {
  it('같은 id는 항상 같은 모양', () => {
    expect(spineLook('book_demian', 248)).toEqual(spineLook('book_demian', 248));
  });
  it('폭은 쪽수에 비례해 26~42px', () => {
    expect(spineLook('x', 50).width).toBe(26);
    expect(spineLook('x', 300).width).toBe(34);
    expect(spineLook('x', 900).width).toBe(42);
  });
  it('높이 86~128px, 색 1~6, 리넨·미색만 어두운 글자', () => {
    for (let i = 0; i < 300; i++) {
      const look = spineLook(`book_${i}`, 200);
      expect(look.height).toBeGreaterThanOrEqual(86);
      expect(look.height).toBeLessThanOrEqual(128);
      expect(look.colorIndex).toBeGreaterThanOrEqual(1);
      expect(look.colorIndex).toBeLessThanOrEqual(6);
      expect(look.darkInk).toBe(look.colorIndex === 2 || look.colorIndex === 6);
    }
  });
});
