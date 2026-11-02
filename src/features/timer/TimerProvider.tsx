import { useEffect, type ReactNode } from 'react';
import { getSettings } from '../../db/settings';
import { useLiveQuery } from '../../db/useLiveQuery';
import { soundEngine } from '../sound/engine';
import { musicPlayer } from '../sound/music';
import { BREAK_LEVEL } from '../sound/sounds';
import { toChimeStyle } from './chime';
import { TimerContext } from './timerContext';
import { useTimerState } from './useTimer';
import { useWakeLock } from './useWakeLock';

/** 타이머 상태를 앱 전체에 나누고, 집중·휴식에 맞춰 환경음을 페이드합니다(T-07). */
export function TimerProvider({ children }: { children: ReactNode }) {
  const settings = useLiveQuery(getSettings, []);
  const timer = useTimerState(toChimeStyle(settings?.chime));
  const phase = timer.view?.phase;

  // 타이머가 돌아가는 동안(일시정지 제외) 화면 꺼짐 방지
  useWakeLock(!!timer.active && !timer.paused && (settings?.wakeLock ?? true));

  useEffect(() => {
    void soundEngine.init();
    musicPlayer.init();
  }, []);

  useEffect(() => {
    soundEngine.setPhaseLevel(!phase || phase === 'focus' ? 1 : BREAK_LEVEL);
  }, [phase]);

  return <TimerContext.Provider value={timer}>{children}</TimerContext.Provider>;
}
