import { useEffect, type ReactNode } from 'react';
import { soundEngine } from '../sound/engine';
import { BREAK_LEVEL } from '../sound/sounds';
import { TimerContext } from './timerContext';
import { useTimerState } from './useTimer';

/** 타이머 상태를 앱 전체에 나누고, 집중·휴식에 맞춰 환경음을 페이드합니다(T-07). */
export function TimerProvider({ children }: { children: ReactNode }) {
  const timer = useTimerState();
  const phase = timer.view?.phase;

  useEffect(() => {
    void soundEngine.init();
  }, []);

  useEffect(() => {
    soundEngine.setPhaseLevel(!phase || phase === 'focus' ? 1 : BREAK_LEVEL);
  }, [phase]);

  return <TimerContext.Provider value={timer}>{children}</TimerContext.Provider>;
}
