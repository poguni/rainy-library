import { useMemo, useState } from 'react';
import { db } from '../../db/db';
import { useLiveQuery } from '../../db/useLiveQuery';
import {
  calendarCells,
  monthBars,
  monthSummary,
  secondsByDay,
  streakDays,
  weekBars,
} from '../../lib/stats';

export type BarMode = 'week' | 'month';

/** 기록 탭 통계: 주간·월간 막대, 독서 달력, 이번 달 요약(B-06) */
export function useStats() {
  const sessions = useLiveQuery(() => db.sessions.toArray(), []);
  const finishedCount = useLiveQuery(() => db.books.where('status').equals('finished').count(), []);
  // 화면을 연 날을 '오늘'로 씁니다.
  const [today] = useState(() => new Date());
  const [mode, setMode] = useState<BarMode>('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [month, setMonth] = useState({ y: today.getFullYear(), m: today.getMonth() });

  const byDay = useMemo(() => secondsByDay(sessions ?? []), [sessions]);
  const bars = mode === 'week' ? weekBars(byDay, today, weekOffset) : monthBars(byDay, today);
  const isThisMonth = month.y === today.getFullYear() && month.m === today.getMonth();

  return {
    loading: !sessions,
    empty: sessions?.length === 0,
    today,
    mode,
    setMode,
    bars,
    weekOffset,
    prevWeek: () => setWeekOffset((w) => w - 1),
    nextWeek: () => setWeekOffset((w) => Math.min(0, w + 1)),
    month,
    isThisMonth,
    prevMonth: () => setMonth(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 })),
    nextMonth: () =>
      isThisMonth || setMonth(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 })),
    cells: calendarCells(byDay, month.y, month.m, today),
    thisMonth: monthSummary(byDay, today.getFullYear(), today.getMonth()),
    streak: streakDays(byDay, today),
    finishedCount: finishedCount ?? 0,
  };
}
