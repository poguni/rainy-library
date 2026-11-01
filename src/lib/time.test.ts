import { formatDuration } from './time';

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
