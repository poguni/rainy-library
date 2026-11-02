// 테마 고르기(PRD TH-05~TH-07). index.html의 인라인 스크립트도 같은 규칙을 씁니다(바꿀 때 함께 고칠 것).
export type ThemeChoice = 'paper' | 'emerald' | 'auto';
export type AutoRule = 'system' | 'schedule';
export type AppliedTheme = 'paper' | 'emerald';

/** "HH:MM" → 자정부터 분 */
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** 지정 시각 안인지. 시작이 끝보다 늦으면(19:00~07:00) 자정을 넘는 구간으로 봅니다. */
export function inNightWindow(now: Date, start: string, end: string): boolean {
  const t = now.getHours() * 60 + now.getMinutes();
  const s = toMinutes(start);
  const e = toMinutes(end);
  if (s === e) return false;
  return s < e ? t >= s && t < e : t >= s || t < e;
}

export interface ThemeInput {
  choice: ThemeChoice;
  rule: AutoRule;
  nightStart: string;
  nightEnd: string;
}

/** 실제로 칠할 테마. 자동: 기기 다크 모드(기본) 또는 지정 시각에 에메랄드 */
export function resolveTheme(input: ThemeInput, prefersDark: boolean, now: Date): AppliedTheme {
  if (input.choice !== 'auto') return input.choice;
  const night =
    input.rule === 'schedule' ? inNightWindow(now, input.nightStart, input.nightEnd) : prefersDark;
  return night ? 'emerald' : 'paper';
}
