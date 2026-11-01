// 읽기 속도와 완독 예상일(PRD 6장). 모두 순수 함수입니다.
import type { Book, Session } from '../db/types';

/** 이보다 짧은 세션은 속도 계산에서 뺍니다(3분) */
export const MIN_SPEED_SECONDS = 180;
/** 완독 예상일을 알려 주려면 필요한 세션 수 */
export const MIN_SESSIONS_FOR_ESTIMATE = 3;
const RECENT_SESSIONS = 5;
const DAILY_WINDOW_DAYS = 14;

/** 세션에서 읽은 쪽수. 쪽수를 적지 않았으면 null */
export function sessionPages(s: Session): number | null {
  if (s.startPage === null || s.endPage === null) return null;
  return s.endPage - s.startPage;
}

/** 속도 계산에 쓸 수 있는 세션인지: 쪽수가 있고 3분 이상 */
export function countsForSpeed(s: Session): boolean {
  const pages = sessionPages(s);
  return pages !== null && pages >= 0 && s.focusSeconds >= MIN_SPEED_SECONDS;
}

/** 세션 속도(쪽/분). 계산할 수 없으면 null */
export function sessionSpeed(s: Session): number | null {
  return countsForSpeed(s) ? sessionPages(s)! / (s.focusSeconds / 60) : null;
}

function speedOf(list: Session[]): number | null {
  let pages = 0;
  let sec = 0;
  for (const s of list) {
    pages += sessionPages(s)!;
    sec += s.focusSeconds;
  }
  return sec > 0 ? pages / (sec / 60) : null;
}

function eligible(sessions: Session[], bookId: string): Session[] {
  return sessions
    .filter((s) => s.bookId === bookId && countsForSpeed(s))
    .sort((a, b) => (a.endedAt < b.endedAt ? -1 : 1));
}

/** 책 평균 속도 = 총 읽은 쪽수 ÷ 총 독서 시간(분), 쓸 수 있는 세션만 */
export function bookAverageSpeed(sessions: Session[], bookId: string): number | null {
  return speedOf(eligible(sessions, bookId));
}

/** 최근 평균 속도: 쓸 수 있는 최근 5개 세션 */
export function recentSpeed(sessions: Session[], bookId: string): number | null {
  return speedOf(eligible(sessions, bookId).slice(-RECENT_SESSIONS));
}

function localDay(d: Date): number {
  return Math.round(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86_400_000);
}

/** 하루 평균 독서량(분) = 이 책의 최근 14일(오늘 포함) 독서 시간 합 ÷ 14 */
export function dailyAverageMinutes(sessions: Session[], bookId: string, today: Date): number {
  const end = localDay(today);
  let sec = 0;
  for (const s of sessions) {
    if (s.bookId !== bookId) continue;
    const day = localDay(new Date(s.startedAt));
    if (day > end - DAILY_WINDOW_DAYS && day <= end) sec += s.focusSeconds;
  }
  return sec / 60 / DAILY_WINDOW_DAYS;
}

/** 계산의 핵심: 남은 시간(분)과 남은 일수 */
export function estimateRemaining(remainingPages: number, speed: number, dailyMin: number) {
  const remainingMin = remainingPages / speed;
  return { remainingMin, days: Math.ceil(remainingMin / dailyMin) };
}

export type FinishEstimate =
  | { kind: 'ok'; date: Date; remainingMin: number; days: number }
  | { kind: 'need-more' }
  | { kind: 'no-recent' }
  | { kind: 'done' };

/** 완독 예상일(B-04) */
export function finishEstimate(book: Book, sessions: Session[], today: Date): FinishEstimate {
  const remainingPages = book.totalPages - book.currentPage;
  if (book.status === 'finished' || remainingPages <= 0) return { kind: 'done' };
  if (eligible(sessions, book.id).length < MIN_SESSIONS_FOR_ESTIMATE) return { kind: 'need-more' };
  const speed = recentSpeed(sessions, book.id);
  const daily = dailyAverageMinutes(sessions, book.id, today);
  if (!speed || daily <= 0) return { kind: 'no-recent' };
  const { remainingMin, days } = estimateRemaining(remainingPages, speed, daily);
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + days);
  return { kind: 'ok', date, remainingMin, days };
}

/** "0.44쪽/분" (소수점 둘째 자리, P-03) */
export function formatSpeed(speed: number): string {
  return `${speed.toFixed(2)}쪽/분`;
}

/** 세션 결과 한 줄(P-03): "22쪽 / 50분 → 0.44쪽/분". 속도를 낼 수 없으면 이유를 함께 */
export function sessionSummary(s: Session): { line: string; hint?: string } {
  const minutes = Math.round(s.focusSeconds / 60);
  const pages = sessionPages(s);
  const speed = sessionSpeed(s);
  if (pages !== null && speed !== null) {
    return { line: `${pages}쪽 / ${minutes}분 → ${formatSpeed(speed)}` };
  }
  if (pages === null) {
    return { line: `${minutes}분 읽었어요`, hint: '쪽수를 적으면 읽기 속도도 알려 드려요.' };
  }
  return {
    line: `${pages}쪽 / ${minutes}분`,
    hint: '3분 넘게 읽은 기록부터 읽기 속도에 넣어요.',
  };
}
