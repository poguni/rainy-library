/** 타이머 시간 설정의 허용 범위(분) */
export const MINUTE_RANGES = {
  focusMin: { label: '집중 시간', min: 5, max: 90 },
  shortBreakMin: { label: '짧은 휴식', min: 1, max: 30 },
  longBreakMin: { label: '긴 휴식', min: 5, max: 60 },
} as const;

export type MinuteField = keyof typeof MINUTE_RANGES;

/** 입력한 분이 범위 안의 정수인지 확인합니다. 문제가 있으면 안내 문장 */
export function checkMinutes(field: MinuteField, input: string): string | null {
  const { min, max } = MINUTE_RANGES[field];
  const value = Number(input);
  if (input.trim() === '' || !Number.isInteger(value) || value < min || value > max) {
    return `${min}분에서 ${max}분 사이로 적어 주세요.`;
  }
  return null;
}
