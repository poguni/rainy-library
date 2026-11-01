import { createContext, useContext } from 'react';
import type { useTimerState } from './useTimer';

export const TimerContext = createContext<ReturnType<typeof useTimerState> | null>(null);

/** 앱 어디서나 같은 타이머를 씁니다(탭을 옮겨도 전환 알림·소리 페이드가 동작). */
export function useTimer() {
  const timer = useContext(TimerContext);
  if (!timer) throw new Error('TimerProvider 안에서 써야 해요.');
  return timer;
}
