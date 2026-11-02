import { useEffect, useRef } from 'react';
import { getSettings } from '../db/settings';
import { useLiveQuery } from '../db/useLiveQuery';
import { resolveTheme, type ThemeInput } from '../lib/theme';
import { applyTheme, mirrorTheme, prefersDark } from './applyTheme';

/**
 * 저장된 테마 설정을 화면에 적용합니다(TH-05~TH-07). 그리는 것은 없습니다.
 * 자동 모드는 쓰는 도중에 갑자기 바뀌지 않게, 앱으로 돌아올 때만 다시 계산합니다.
 */
export function ThemeSync() {
  const settings = useLiveQuery(getSettings, []);
  const first = useRef(true);
  const input: ThemeInput | null = settings
    ? {
        choice: settings.theme,
        rule: settings.autoRule,
        nightStart: settings.nightStart,
        nightEnd: settings.nightEnd,
      }
    : null;
  const key = input && JSON.stringify(input);

  useEffect(() => {
    if (!input) return;
    // 처음 한 번은 index.html이 이미 칠해 둔 것과 맞추기만 하므로 효과 없이 바꿉니다.
    applyTheme(resolveTheme(input, prefersDark(), new Date()), !first.current);
    first.current = false;
    mirrorTheme(input);
    if (input.choice !== 'auto') return;
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        applyTheme(resolveTheme(input, prefersDark(), new Date()), true);
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
    // input은 key로 비교합니다(같은 값이면 다시 적용하지 않음).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return null;
}
