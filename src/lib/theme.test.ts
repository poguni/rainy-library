import { inNightWindow, resolveTheme, toMinutes } from './theme';

const at = (h: number, m = 0) => new Date(2026, 10, 2, h, m);
const base = { rule: 'system' as const, nightStart: '19:00', nightEnd: '07:00' };

describe('toMinutes', () => {
  it('시:분을 분으로', () => {
    expect(toMinutes('07:30')).toBe(450);
    expect(toMinutes('00:00')).toBe(0);
  });
});

describe('inNightWindow', () => {
  it('자정을 넘는 구간(19:00~07:00)', () => {
    expect(inNightWindow(at(19), '19:00', '07:00')).toBe(true);
    expect(inNightWindow(at(23, 59), '19:00', '07:00')).toBe(true);
    expect(inNightWindow(at(3), '19:00', '07:00')).toBe(true);
    expect(inNightWindow(at(7), '19:00', '07:00')).toBe(false);
    expect(inNightWindow(at(12), '19:00', '07:00')).toBe(false);
    expect(inNightWindow(at(18, 59), '19:00', '07:00')).toBe(false);
  });
  it('같은 날 안의 구간(13:00~15:00)', () => {
    expect(inNightWindow(at(14), '13:00', '15:00')).toBe(true);
    expect(inNightWindow(at(15), '13:00', '15:00')).toBe(false);
  });
  it('시작과 끝이 같으면 늘 아님', () => {
    expect(inNightWindow(at(10), '10:00', '10:00')).toBe(false);
  });
});

describe('resolveTheme', () => {
  it('직접 고른 테마는 그대로', () => {
    expect(resolveTheme({ ...base, choice: 'emerald' }, false, at(12))).toBe('emerald');
    expect(resolveTheme({ ...base, choice: 'paper' }, true, at(23))).toBe('paper');
  });
  it('자동 + 기기 다크 모드', () => {
    expect(resolveTheme({ ...base, choice: 'auto' }, true, at(12))).toBe('emerald');
    expect(resolveTheme({ ...base, choice: 'auto' }, false, at(23))).toBe('paper');
  });
  it('자동 + 지정 시각(기기 다크 모드는 무시)', () => {
    const input = { ...base, choice: 'auto' as const, rule: 'schedule' as const };
    expect(resolveTheme(input, false, at(21))).toBe('emerald');
    expect(resolveTheme(input, true, at(12))).toBe('paper');
  });
});
