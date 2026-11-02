import type { Session } from '../db/types';
import {
  calendarCells,
  dayKey,
  heatLevel,
  monthBars,
  monthSummary,
  secondsByDay,
  streakDays,
  weekBars,
  weekStart,
} from './stats';

const ses = (start: Date, min: number): Session => ({
  id: `ses_${start.getTime()}`,
  bookId: 'book_1',
  startedAt: start.toISOString(),
  endedAt: new Date(start.getTime() + min * 60_000).toISOString(),
  focusSeconds: min * 60,
  startPage: null,
  endPage: null,
  mode: 'free',
});

// 2026-11-04(수)
const today = new Date(2026, 10, 4, 21, 0);

describe('dayKey / secondsByDay', () => {
  it('기기 시간대 날짜로 묶고, 같은 날은 더한다', () => {
    const map = secondsByDay([
      ses(new Date(2026, 10, 3, 23, 50), 20), // 자정을 넘겨도 시작한 날
      ses(new Date(2026, 10, 3, 9, 0), 10),
      ses(new Date(2026, 10, 4, 7, 0), 5),
    ]);
    expect(map.get('2026-11-03')).toBe(30 * 60);
    expect(map.get('2026-11-04')).toBe(5 * 60);
    expect(dayKey(new Date(2026, 0, 9))).toBe('2026-01-09');
  });
});

describe('weekBars', () => {
  const map = secondsByDay([ses(new Date(2026, 10, 2, 9), 30), ses(new Date(2026, 10, 4, 9), 45)]);
  it('월요일부터 7칸, 오늘 표시, 앞으로 올 날 표시', () => {
    const bars = weekBars(map, today);
    expect(bars.map((b) => b.label)).toEqual(['월', '화', '수', '목', '금', '토', '일']);
    expect(bars[0]).toMatchObject({ key: '2026-11-02', minutes: 30 });
    expect(bars[2]).toMatchObject({ minutes: 45, current: true, future: false });
    expect(bars[3].future).toBe(true);
  });
  it('지난주', () => {
    expect(weekBars(map, today, -1)[0].key).toBe('2026-10-26');
  });
  it('일요일이 오늘이면 그 주 월요일부터', () => {
    expect(dayKey(weekStart(new Date(2026, 10, 8)))).toBe('2026-11-02');
  });
});

describe('monthBars', () => {
  it('최근 6개월 합계, 해를 넘겨도 맞다', () => {
    const map = secondsByDay([ses(new Date(2026, 0, 5), 60), ses(new Date(2025, 11, 1), 30)]);
    const bars = monthBars(map, new Date(2026, 1, 10));
    expect(bars.map((b) => b.label)).toEqual(['9월', '10월', '11월', '12월', '1월', '2월']);
    expect(bars[3].minutes).toBe(30);
    expect(bars[4].minutes).toBe(60);
    expect(bars[5].current).toBe(true);
  });
});

describe('calendarCells', () => {
  it('2026년 11월은 일요일 시작 → 월요일 기준 앞 빈칸 6개, 30일', () => {
    const cells = calendarCells(new Map([['2026-11-03', 40 * 60]]), 2026, 10, today);
    expect(cells.slice(0, 6)).toEqual(Array(6).fill(null));
    const real = cells.filter((c) => c !== null);
    expect(real).toHaveLength(30);
    expect(real[2]).toMatchObject({ day: 3, minutes: 40, level: 3 });
    expect(real[3].today).toBe(true);
    expect(real[4].future).toBe(true);
  });
});

describe('heatLevel', () => {
  it('구간', () => {
    expect([0, 5, 15, 30, 59, 60, 200].map(heatLevel)).toEqual([0, 1, 2, 3, 3, 4, 4]);
  });
});

describe('streakDays', () => {
  const map = new Map([
    ['2026-11-02', 60],
    ['2026-11-03', 60],
  ]);
  it('오늘 안 읽었으면 어제까지 이어진 날', () => {
    expect(streakDays(map, today)).toBe(2);
  });
  it('오늘 읽었으면 오늘 포함', () => {
    expect(streakDays(new Map([...map, ['2026-11-04', 60]]), today)).toBe(3);
  });
  it('어제도 안 읽었으면 0', () => {
    expect(streakDays(new Map([['2026-11-01', 60]]), today)).toBe(0);
  });
});

describe('monthSummary', () => {
  it('그 달 합계와 읽은 날', () => {
    const map = new Map([
      ['2026-11-01', 600],
      ['2026-11-03', 1200],
      ['2026-10-31', 999],
    ]);
    expect(monthSummary(map, 2026, 10)).toEqual({ minutes: 30, days: 2 });
  });
});
