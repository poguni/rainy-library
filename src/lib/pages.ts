import type { Book, Session } from '../db/types';

/** 시작 쪽수 기본값(P-01): 이 책의 직전 세션 끝 쪽수, 없으면 현재 쪽수(처음이면 1쪽) */
export function defaultStartPage(book: Book, sessions: Session[]): number {
  let last: Session | undefined;
  for (const s of sessions) {
    if (s.bookId !== book.id || s.endPage === null) continue;
    if (!last || s.endedAt > last.endedAt) last = s;
  }
  return last?.endPage ?? Math.max(book.currentPage, 1);
}

export type PageProblem = 'invalid' | 'below-start' | 'over-total';

/** 시작 쪽수 검사: 1 ~ 전체 쪽수 */
export function checkStartPage(start: number, total: number): PageProblem | null {
  if (!Number.isInteger(start) || start < 1) return 'invalid';
  if (start > total) return 'over-total';
  return null;
}

/** 끝 쪽수 검사(P-04) */
export function checkEndPage(start: number, end: number, total: number): PageProblem | null {
  if (!Number.isInteger(end) || end < 0) return 'invalid';
  if (end < start) return 'below-start';
  if (end > total) return 'over-total';
  return null;
}
