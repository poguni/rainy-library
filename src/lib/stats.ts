// 기록 탭 통계(B-06). 날짜는 모두 기기 시간대 기준이며, 세션은 시작한 날에 넣습니다.
import type { Session } from '../db/types';

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

/** 'YYYY-MM-DD'(기기 시간대) */
export function dayKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 날짜별 독서 시간(초) */
export function secondsByDay(sessions: Session[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const s of sessions) {
    const key = dayKey(new Date(s.startedAt));
    map.set(key, (map.get(key) ?? 0) + s.focusSeconds);
  }
  return map;
}

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** 그 주의 월요일 */
export function weekStart(d: Date): Date {
  return addDays(d, -((d.getDay() + 6) % 7));
}

export interface Bar {
  key: string;
  label: string;
  minutes: number;
  /** 오늘(이번 달) 막대 */
  current: boolean;
  /** 아직 오지 않은 날(달) */
  future: boolean;
}

/** 주간 막대 7개(월~일). offset=-1이면 지난주 */
export function weekBars(byDay: Map<string, number>, today: Date, offset = 0): Bar[] {
  const start = addDays(weekStart(today), offset * 7);
  const todayKey = dayKey(today);
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(start, i);
    const key = dayKey(d);
    return {
      key,
      label: WEEKDAY[d.getDay()],
      minutes: Math.round((byDay.get(key) ?? 0) / 60),
      current: key === todayKey,
      future: key > todayKey,
    };
  });
}

/** 월간 막대: 이번 달까지 최근 count개월의 합계 */
export function monthBars(byDay: Map<string, number>, today: Date, count = 6): Bar[] {
  const sums = new Map<string, number>();
  for (const [key, sec] of byDay) {
    const m = key.slice(0, 7);
    sums.set(m, (sums.get(m) ?? 0) + sec);
  }
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (count - 1 - i), 1);
    const key = dayKey(d).slice(0, 7);
    return {
      key,
      label: `${d.getMonth() + 1}월`,
      minutes: Math.round((sums.get(key) ?? 0) / 60),
      current: i === count - 1,
      future: false,
    };
  });
}

/** 잔디 칸 진하기 0~4: 안 읽음 / 15분 미만 / 30분 미만 / 60분 미만 / 60분 이상 */
export function heatLevel(minutes: number): 0 | 1 | 2 | 3 | 4 {
  if (minutes <= 0) return 0;
  if (minutes < 15) return 1;
  if (minutes < 30) return 2;
  if (minutes < 60) return 3;
  return 4;
}

export interface CalendarCell {
  key: string;
  day: number;
  minutes: number;
  level: 0 | 1 | 2 | 3 | 4;
  today: boolean;
  future: boolean;
}

/** 독서 달력: 월요일부터 시작하는 주 단위 칸. 달 앞쪽 빈칸은 null */
export function calendarCells(
  byDay: Map<string, number>,
  year: number,
  month: number,
  today: Date,
): (CalendarCell | null)[] {
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7;
  const todayKey = dayKey(today);
  const cells: (CalendarCell | null)[] = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= days; day++) {
    const key = dayKey(new Date(year, month, day));
    const minutes = Math.round((byDay.get(key) ?? 0) / 60);
    cells.push({
      key,
      day,
      minutes,
      level: heatLevel(minutes),
      today: key === todayKey,
      future: key > todayKey,
    });
  }
  return cells;
}

/** 오늘(또는 어제)부터 거꾸로 이어서 읽은 날 수. 오늘 아직 안 읽었으면 어제까지 셉니다. */
export function streakDays(byDay: Map<string, number>, today: Date): number {
  let d = byDay.get(dayKey(today)) ? today : addDays(today, -1);
  let n = 0;
  while ((byDay.get(dayKey(d)) ?? 0) > 0) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

/** 그 달의 합계(분)와 읽은 날 수 */
export function monthSummary(byDay: Map<string, number>, year: number, month: number) {
  const prefix = dayKey(new Date(year, month, 1)).slice(0, 7);
  let sec = 0;
  let days = 0;
  for (const [key, s] of byDay) {
    if (key.startsWith(prefix) && s > 0) {
      sec += s;
      days++;
    }
  }
  return { minutes: Math.round(sec / 60), days };
}
