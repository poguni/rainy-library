import { useSyncExternalStore } from 'react';

export type ThemeName = 'paper' | 'emerald';

const read = (): ThemeName =>
  document.documentElement.dataset.theme === 'emerald' ? 'emerald' : 'paper';

/** <html data-theme>이 바뀌면 다시 그립니다(테마는 index.html 스크립트와 9단계 설정이 정함). */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

/** 지금 화면에 적용된 테마 이름 */
export function useThemeName(): ThemeName {
  return useSyncExternalStore(subscribe, read, () => 'paper');
}
