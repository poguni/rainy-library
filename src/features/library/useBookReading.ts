import { useState } from 'react';
import { db } from '../../db/db';
import { useLiveQuery } from '../../db/useLiveQuery';
import type { Book } from '../../db/types';
import { bookAverageSpeed, finishEstimate, formatSpeed } from '../../lib/reading';
import { formatApproxMinutes, formatKoreanDate } from '../../lib/time';
import type { FinishCardProps } from '../../theme/variants/paper/FinishCard';

const NOTE = {
  'need-more': '기록이 더 쌓이면 알려 드릴게요.',
  'no-recent': '최근 2주 동안 읽은 기록이 없어서 아직 알 수 없어요.',
  done: '마지막 장까지 다 읽었어요.',
} as const;

/** 책 한 권의 평균 속도와 완독 예상일(FinishCard에 넘길 값) */
export function useBookReading(book?: Book) {
  const bookId = book?.id;
  const sessions = useLiveQuery(
    () => (bookId ? db.sessions.where('bookId').equals(bookId).toArray() : Promise.resolve([])),
    [bookId],
  );
  // 화면을 연 날을 '오늘'로 씁니다.
  const [today] = useState(() => new Date());

  if (!book || !sessions) return { speedText: '—', finish: undefined };

  const speed = bookAverageSpeed(sessions, book.id);
  const est = finishEstimate(book, sessions, today);
  const finish: FinishCardProps =
    est.kind === 'ok'
      ? {
          date: est.date,
          remainingMin: est.remainingMin,
          note: '',
          dateText: formatKoreanDate(est.date),
          remainingText: formatApproxMinutes(est.remainingMin),
        }
      : { date: null, remainingMin: 0, note: NOTE[est.kind], dateText: '', remainingText: '' };

  return { speedText: speed === null ? '—' : formatSpeed(speed), finish };
}
