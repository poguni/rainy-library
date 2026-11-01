import { useCallback, useEffect, useRef, useState } from 'react';
import { saveSession } from '../../db/sessions';
import { newId } from '../../lib/id';
import {
  catchUp,
  focusMs,
  pauseTimer,
  phaseLength,
  remainingMs,
  phaseElapsed,
  resumeTimer,
  skipPhase,
  startTimer,
  type Durations,
  type TimerMode,
  type TimerState,
} from '../../lib/timer';
import { unlockAudio } from '../sound/audioContext';
import { playChime } from './chime';
import { askNotifyPermission, notifyPhase } from './notify';

/** 진행 중인 세션. 새로고침 후 바로 이어지도록 localStorage에 둡니다(기기 밖으로 나가지 않음). */
export interface ActiveSession {
  timer: TimerState;
  /** 시작할 때의 설정을 고정해, 도중에 설정을 바꿔도 시간이 흔들리지 않게 합니다. */
  durations: Durations;
  bookId: string;
  startPage: number;
  startedAt: number;
}

const KEY = 'rl-active-session';

function load(): ActiveSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ActiveSession) : null;
  } catch {
    return null;
  }
}

function store(a: ActiveSession | null) {
  try {
    if (a) localStorage.setItem(KEY, JSON.stringify(a));
    else localStorage.removeItem(KEY);
  } catch {
    // 저장 공간을 쓸 수 없어도 타이머는 계속 동작합니다.
  }
}

/** 방금(10초 안에) 바뀐 구간만 소리로 알립니다. 오래 닫아 두었다 연 경우엔 조용히 따라잡기만. */
function announce(state: TimerState, now: number) {
  if (now - state.phaseStart > 10_000) return;
  playChime(state.phase === 'focus' ? 'breakEnd' : 'focusEnd');
  notifyPhase(state.phase);
}

export function useTimer() {
  const [active, setActiveState] = useState<ActiveSession | null>(load);
  const [now, setNow] = useState(() => Date.now());
  const ref = useRef(active);

  const setActive = useCallback((a: ActiveSession | null) => {
    ref.current = a;
    store(a);
    setActiveState(a);
  }, []);

  /** 지금 시각까지 따라잡은 뒤 fn을 적용합니다. */
  const apply = useCallback(
    (fn: (s: TimerState, t: number, d: Durations) => TimerState) => {
      const a = ref.current;
      if (!a) return;
      const t = Date.now();
      setNow(t);
      const { state } = catchUp(a.timer, a.durations, t);
      setActive({ ...a, timer: fn(state, t, a.durations) });
    },
    [setActive],
  );

  const running = !!active && active.timer.pausedAt === null;

  // 화면 갱신만 1초마다 합니다. 시간 계산은 항상 Date.now() 기준입니다.
  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      const a = ref.current;
      if (!a) return;
      const { state, entered } = catchUp(a.timer, a.durations, t);
      if (entered.length > 0) {
        setActive({ ...a, timer: state });
        announce(state, t);
      }
    };
    const id = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [running, setActive]);

  const view = active ? catchUp(active.timer, active.durations, now).state : null;

  return {
    active,
    view,
    paused: !!view && view.pausedAt !== null,
    /** 뽀모도로: 남은 초 / 자유: 흐른 초 */
    displaySec:
      active && view
        ? view.mode === 'free'
          ? Math.floor(phaseElapsed(view, now) / 1000)
          : Math.ceil((remainingMs(view, active.durations, now) ?? 0) / 1000)
        : 0,
    totalSec: active && view ? (phaseLength(view, active.durations) ?? 0) / 1000 : 0,
    focusSec: active && view ? Math.floor(focusMs(view, active.durations, now) / 1000) : 0,

    start: (mode: TimerMode, bookId: string, startPage: number, durations: Durations) => {
      void unlockAudio();
      askNotifyPermission();
      const t = Date.now();
      setNow(t);
      setActive({ timer: startTimer(mode, t), durations, bookId, startPage, startedAt: t });
    },
    pause: () => apply((s, t) => pauseTimer(s, t)),
    resume: () => {
      void unlockAudio();
      apply((s, t) => resumeTimer(s, t));
    },
    skip: () => apply((s, t, d) => skipPhase(s, d, t)),

    /** 세션을 기록하고 타이머를 비웁니다. endPage가 null이면 시간만 기록(P-02). */
    finish: async (endPage: number | null) => {
      const a = ref.current;
      if (!a) return null;
      const t = Date.now();
      const { state } = catchUp(a.timer, a.durations, t);
      const end = state.pausedAt ?? t;
      const session = {
        id: newId('ses'),
        bookId: a.bookId,
        startedAt: new Date(a.startedAt).toISOString(),
        endedAt: new Date(end).toISOString(),
        focusSeconds: Math.floor(focusMs(state, a.durations, t) / 1000),
        startPage: a.startPage,
        endPage,
        mode: state.mode,
      };
      await saveSession(session);
      setActive(null);
      return session;
    },
  };
}
