import { useEffect } from 'react';

/** 타이머가 돌아가는 동안 화면이 꺼지지 않게 합니다(T-06). 지원하지 않는 브라우저에서는 아무것도 안 함 */
export function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const request = async () => {
      if (document.visibilityState !== 'visible' || (lock && !lock.released)) return;
      try {
        lock = await navigator.wakeLock.request('screen');
        if (cancelled) void lock.release();
      } catch {
        // 배터리 절약 모드 등으로 거절될 수 있습니다.
      }
    };
    // 다른 앱에 다녀오면 브라우저가 풀어 버리므로 돌아올 때 다시 요청합니다.
    const onVisible = () => void request();
    void request();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void lock?.release();
    };
  }, [enabled]);
}
