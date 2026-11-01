// 타이머 계산(순수 함수). 횟수를 세지 않고 "구간 시작 시각 + 일시정지 누적"으로 계산합니다.
export type TimerMode = 'pomodoro' | 'free';
export type Phase = 'focus' | 'shortBreak' | 'longBreak';

/** 몇 번째 집중마다 긴 휴식인지 */
export const ROUNDS_PER_CYCLE = 4;

export interface Durations {
  focusMin: number;
  shortBreakMin: number;
  longBreakMin: number;
}

export interface TimerState {
  mode: TimerMode;
  phase: Phase;
  /** 지금까지 시작한 집중 회차(1부터) */
  round: number;
  /** 현재 구간 시작 시각(ms) */
  phaseStart: number;
  /** 일시정지한 시각, 진행 중이면 null */
  pausedAt: number | null;
  /** 현재 구간에서 일시정지로 흘려보낸 시간(ms) */
  pausedMs: number;
  /** 이미 끝난 집중 구간들의 집중 시간 합(ms) */
  focusDoneMs: number;
}

const MIN = 60_000;

export function startTimer(mode: TimerMode, now: number): TimerState {
  return {
    mode,
    phase: 'focus',
    round: 1,
    phaseStart: now,
    pausedAt: null,
    pausedMs: 0,
    focusDoneMs: 0,
  };
}

/** 현재 구간에서 실제로 흐른 시간(일시정지 제외) */
export function phaseElapsed(s: TimerState, now: number): number {
  return Math.max(0, (s.pausedAt ?? now) - s.phaseStart - s.pausedMs);
}

/** 현재 구간 길이(ms). 자유 모드는 끝이 없어 null */
export function phaseLength(s: TimerState, d: Durations): number | null {
  if (s.mode === 'free') return null;
  if (s.phase === 'focus') return d.focusMin * MIN;
  return (s.phase === 'longBreak' ? d.longBreakMin : d.shortBreakMin) * MIN;
}

export function remainingMs(s: TimerState, d: Durations, now: number): number | null {
  const len = phaseLength(s, d);
  return len === null ? null : Math.max(0, len - phaseElapsed(s, now));
}

function next(s: TimerState): Pick<TimerState, 'phase' | 'round'> {
  if (s.phase === 'focus') {
    return {
      phase: s.round % ROUNDS_PER_CYCLE === 0 ? 'longBreak' : 'shortBreak',
      round: s.round,
    };
  }
  return { phase: 'focus', round: s.round + 1 };
}

/** 끝난 구간을 모두 넘깁니다(새로고침·백그라운드 후 따라잡기). entered: 새로 들어간 구간들 */
export function catchUp(s: TimerState, d: Durations, now: number) {
  const entered: Phase[] = [];
  let cur = s;
  let len = phaseLength(cur, d);
  while (len !== null && phaseElapsed(cur, now) >= len) {
    cur = {
      ...cur,
      ...next(cur),
      focusDoneMs: cur.focusDoneMs + (cur.phase === 'focus' ? len : 0),
      phaseStart: cur.phaseStart + cur.pausedMs + len,
      pausedMs: 0,
    };
    entered.push(cur.phase);
    len = phaseLength(cur, d);
  }
  return { state: cur, entered };
}

export function pauseTimer(s: TimerState, now: number): TimerState {
  return s.pausedAt === null ? { ...s, pausedAt: now } : s;
}

export function resumeTimer(s: TimerState, now: number): TimerState {
  if (s.pausedAt === null) return s;
  return { ...s, pausedMs: s.pausedMs + (now - s.pausedAt), pausedAt: null };
}

/** 지금 구간을 바로 끝내고 다음 구간을 시작합니다(쉬어가기 / 휴식 건너뛰기). */
export function skipPhase(s: TimerState, d: Durations, now: number): TimerState {
  if (s.mode === 'free') return s;
  const len = phaseLength(s, d) ?? 0;
  const done = s.phase === 'focus' ? Math.min(phaseElapsed(s, now), len) : 0;
  return {
    ...s,
    ...next(s),
    focusDoneMs: s.focusDoneMs + done,
    phaseStart: now,
    pausedAt: null,
    pausedMs: 0,
  };
}

/** 세션 전체의 집중 시간(ms). 휴식과 일시정지는 빠집니다. */
export function focusMs(s: TimerState, d: Durations, now: number): number {
  if (s.phase !== 'focus') return s.focusDoneMs;
  const len = phaseLength(s, d);
  const elapsed = phaseElapsed(s, now);
  return s.focusDoneMs + (len === null ? elapsed : Math.min(elapsed, len));
}

/** 화면에 보일 4회 주기 안의 회차(1~4) */
export function roundInCycle(round: number): number {
  return ((round - 1) % ROUNDS_PER_CYCLE) + 1;
}
