import { formatClock, formatDuration, todayLine } from './time';

describe('formatDuration', () => {
  it.each([
    [0, '0분'],
    [59, '0분'],
    [1500, '25분'],
    [3600, '1시간'],
    [22800, '6시간 20분'],
    [-10, '0분'],
  ])('%i초 → %s', (sec, text) => {
    expect(formatDuration(sec)).toBe(text);
  });
});

describe('formatClock', () => {
  it.each([
    [0, '00:00'],
    [1122, '18:42'],
    [1500, '25:00'],
    [3723, '1:02:03'],
    [-3, '00:00'],
  ])('%i초 → %s', (sec, text) => expect(formatClock(sec)).toBe(text));
});

describe('todayLine', () => {
  it('시안 예: 금요일 저녁, 창밖엔 비', () => {
    expect(todayLine(new Date(2026, 9, 30, 19, 0))).toBe('금요일 저녁, 창밖엔 비');
  });
  it('시간대 경계', () => {
    expect(todayLine(new Date(2026, 9, 31, 5, 0))).toMatch(/^토요일 아침/);
    expect(todayLine(new Date(2026, 9, 31, 12, 0))).toMatch(/오후/);
    expect(todayLine(new Date(2026, 9, 31, 21, 0))).toMatch(/밤/);
    expect(todayLine(new Date(2026, 9, 31, 4, 59))).toMatch(/밤/);
  });
});
