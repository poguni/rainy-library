import type { Session } from '../db/types';

/** 진행률(0~100, 정수 반올림) */
export function progressPercent(currentPage: number, totalPages: number): number {
  if (totalPages <= 0) return 0;
  const ratio = Math.min(Math.max(currentPage / totalPages, 0), 1);
  return Math.round(ratio * 100);
}

export interface BookTotals {
  focusSeconds: number;
  sessionCount: number;
}

/** 책 한 권의 누적 독서 시간과 세션 수 */
export function bookTotals(sessions: Session[], bookId: string): BookTotals {
  let focusSeconds = 0;
  let sessionCount = 0;
  for (const s of sessions) {
    if (s.bookId !== bookId) continue;
    focusSeconds += s.focusSeconds;
    sessionCount += 1;
  }
  return { focusSeconds, sessionCount };
}

function hash(text: string): number {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
  return h;
}

export interface SpineLook {
  /** --spine-1 ~ --spine-6 */
  colorIndex: number;
  /** 밝은 책등(리넨·미색)이면 어두운 글자 */
  darkInk: boolean;
  width: number;
  height: number;
}

/** DESIGN.md 8.4: 색은 id로 고정, 폭은 쪽수에 비례(26~42px), 높이는 id에 따라(100~142px) */
export function spineLook(id: string, totalPages: number): SpineLook {
  const h = hash(id);
  const colorIndex = (h % 6) + 1;
  const pages = Math.min(Math.max(totalPages, 100), 500);
  return {
    colorIndex,
    darkInk: colorIndex === 2 || colorIndex === 6,
    width: Math.round(26 + ((pages - 100) / 400) * 16),
    height: 100 + (Math.floor(h / 6) % 43),
  };
}

/** 타이머 홈의 '지금 읽는 책': 고른 책 → 가장 최근에 읽은 책 → 첫 책 (읽는 중인 책만) */
export function pickCurrentBook<B extends { id: string; status: string }>(
  books: B[],
  sessions: Session[],
  preferredId?: string,
): B | undefined {
  const reading = books.filter((b) => b.status === 'reading');
  const preferred = reading.find((b) => b.id === preferredId);
  if (preferred) return preferred;
  let latest: Session | undefined;
  for (const s of sessions) {
    if (reading.some((b) => b.id === s.bookId) && (!latest || s.endedAt > latest.endedAt))
      latest = s;
  }
  return reading.find((b) => b.id === latest?.bookId) ?? reading[0];
}
