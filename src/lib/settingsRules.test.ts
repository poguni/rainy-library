import { checkMinutes } from './settingsRules';

describe('checkMinutes', () => {
  it('범위 안이면 통과', () => {
    expect(checkMinutes('focusMin', '25')).toBeNull();
    expect(checkMinutes('focusMin', '5')).toBeNull();
    expect(checkMinutes('focusMin', '90')).toBeNull();
    expect(checkMinutes('shortBreakMin', '1')).toBeNull();
  });
  it('범위 밖·빈칸·소수는 안내', () => {
    expect(checkMinutes('focusMin', '4')).toBe('5분에서 90분 사이로 적어 주세요.');
    expect(checkMinutes('focusMin', '91')).not.toBeNull();
    expect(checkMinutes('longBreakMin', '')).toBe('5분에서 60분 사이로 적어 주세요.');
    expect(checkMinutes('shortBreakMin', '2.5')).not.toBeNull();
    expect(checkMinutes('shortBreakMin', '0')).not.toBeNull();
  });
});
