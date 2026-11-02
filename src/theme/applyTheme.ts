// 테마를 <html>에 적용하고, 첫 화면용으로 localStorage에 사본을 둡니다(DESIGN.md 10장).
// 키 이름과 저장 형식은 index.html 인라인 스크립트와 같아야 합니다.
import type { AppliedTheme, ThemeInput } from '../lib/theme';

export const THEME_KEY = 'rl-theme'; // 'paper' | 'emerald' | 'auto'
export const THEME_AUTO_KEY = 'rl-theme-auto'; // {"rule","nightStart","nightEnd"}

const SWITCH_MS = 250;
let switchTimer: ReturnType<typeof setTimeout> | undefined;

/** 기기 다크 모드 */
export function prefersDark(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
}

/** <html data-theme>과 주소창 색을 바꿉니다. animate면 색이 0.2초 동안 부드럽게 넘어갑니다. */
export function applyTheme(theme: AppliedTheme, animate: boolean) {
  const root = document.documentElement;
  if (root.dataset.theme === theme) return;
  if (animate) {
    root.classList.add('theme-switching');
    clearTimeout(switchTimer);
    switchTimer = setTimeout(() => root.classList.remove('theme-switching'), SWITCH_MS);
  }
  root.dataset.theme = theme;
  const color = getComputedStyle(root).getPropertyValue('--theme-color-meta').trim();
  if (color) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
}

/** 다음에 앱을 열 때 첫 화면 전에 읽을 사본 */
export function mirrorTheme(input: ThemeInput) {
  try {
    localStorage.setItem(THEME_KEY, input.choice);
    localStorage.setItem(
      THEME_AUTO_KEY,
      JSON.stringify({ rule: input.rule, nightStart: input.nightStart, nightEnd: input.nightEnd }),
    );
  } catch {
    // 사생활 보호 모드 등에서는 저장하지 못해도 괜찮습니다.
  }
}
