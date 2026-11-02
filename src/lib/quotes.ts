// 책 속 한 문장(순수 함수)
import { dayKey } from './stats';

export const QUOTE_MAX = 300;

export type QuoteProblem = 'empty' | 'too-long' | 'bad-page';

/** 앞뒤 공백을 지우고, 줄 사이의 빈 줄은 하나로 줄입니다(줄바꿈은 살림). */
export function cleanQuote(text: string): string {
  return text
    .trim()
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
}

/** 저장 전 확인. 쪽수는 비워도 되고, 적으면 1~전체 쪽수 */
export function checkQuote(text: string, page: number | undefined, totalPages: number) {
  const t = cleanQuote(text);
  if (!t) return 'empty';
  if (t.length > QUOTE_MAX) return 'too-long';
  if (page !== undefined && (!Number.isInteger(page) || page < 1 || page > totalPages)) {
    return 'bad-page';
  }
  return null;
}

/** 오늘 보여 줄 문장: 날짜마다 정해진 하나(같은 날에는 늘 같은 문장) */
export function quoteOfDay<Q>(quotes: readonly Q[] | undefined, now: Date): Q | undefined {
  if (!quotes?.length) return undefined;
  const key = dayKey(now);
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return quotes[h % quotes.length];
}
