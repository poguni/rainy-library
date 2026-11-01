import {
  catchUp,
  focusMs,
  pauseTimer,
  remainingMs,
  resumeTimer,
  roundInCycle,
  skipPhase,
  startTimer,
  type Durations,
} from './timer';

const d: Durations = { focusMin: 25, shortBreakMin: 5, longBreakMin: 15 };
const MIN = 60_000;
const T0 = Date.UTC(2026, 10, 1, 12, 0, 0);

describe('남은 시간', () => {
  it('시안 예: 6분 18초가 지나면 18:42 남는다', () => {
    const s = startTimer('pomodoro', T0);
    expect(remainingMs(s, d, T0 + 6 * MIN + 18_000)).toBe(18 * MIN + 42_000);
  });

  it('일시정지한 시간은 흐르지 않고 집중 시간에도 들어가지 않는다', () => {
    let s = startTimer('pomodoro', T0);
    s = pauseTimer(s, T0 + 5 * MIN);
    expect(remainingMs(s, d, T0 + 60 * MIN)).toBe(20 * MIN);
    s = resumeTimer(s, T0 + 15 * MIN); // 10분 멈춤
    expect(remainingMs(s, d, T0 + 20 * MIN)).toBe(15 * MIN);
    expect(focusMs(s, d, T0 + 20 * MIN)).toBe(10 * MIN);
  });

  it('저장했다 다시 읽어도(새로고침) 같은 값을 낸다', () => {
    const s = pauseTimer(startTimer('pomodoro', T0), T0 + 3 * MIN);
    const restored = JSON.parse(JSON.stringify(s));
    expect(remainingMs(restored, d, T0 + 99 * MIN)).toBe(remainingMs(s, d, T0 + 99 * MIN));
  });
});

describe('구간 전환(catchUp)', () => {
  it('집중 25분이 끝나면 짧은 휴식으로 넘어간다', () => {
    const { state, entered } = catchUp(startTimer('pomodoro', T0), d, T0 + 26 * MIN);
    expect(entered).toEqual(['shortBreak']);
    expect(state.phaseStart).toBe(T0 + 25 * MIN); // 정확히 끝난 시각부터
    expect(remainingMs(state, d, T0 + 26 * MIN)).toBe(4 * MIN);
  });

  it('오래 닫아 두었다 열면 지나간 구간을 모두 따라잡고, 4회차 뒤에는 긴 휴식', () => {
    // (집중 25 + 휴식 5) × 3 = 90분, 4회차 집중 25분 → 115분에 긴 휴식 시작
    const { state, entered } = catchUp(startTimer('pomodoro', T0), d, T0 + 116 * MIN);
    expect(entered.at(-1)).toBe('longBreak');
    expect(state.round).toBe(4);
    expect(focusMs(state, d, T0 + 116 * MIN)).toBe(100 * MIN); // 휴식은 빠짐
  });

  it('일시정지 전에 이미 끝난 구간은 넘기고, 멈춘 뒤로는 넘어가지 않는다', () => {
    const s = pauseTimer(startTimer('pomodoro', T0), T0 + 27 * MIN);
    const { state, entered } = catchUp(s, d, T0 + 90 * MIN);
    expect(entered).toEqual(['shortBreak']);
    expect(remainingMs(state, d, T0 + 90 * MIN)).toBe(3 * MIN);
  });

  it('긴 휴식이 끝나면 5회차(주기 안에서는 1회차) 집중', () => {
    const { state } = catchUp(startTimer('pomodoro', T0), d, T0 + 131 * MIN);
    expect(state.phase).toBe('focus');
    expect(state.round).toBe(5);
    expect(roundInCycle(state.round)).toBe(1);
  });
});

describe('쉬어가기', () => {
  it('집중 중에 누르면 지금까지 집중 시간만 더하고 휴식 시작', () => {
    const s = skipPhase(startTimer('pomodoro', T0), d, T0 + 10 * MIN);
    expect(s.phase).toBe('shortBreak');
    expect(focusMs(s, d, T0 + 12 * MIN)).toBe(10 * MIN);
    expect(remainingMs(s, d, T0 + 12 * MIN)).toBe(3 * MIN);
  });

  it('휴식 중에 누르면 다음 회차 집중', () => {
    const s = skipPhase(skipPhase(startTimer('pomodoro', T0), d, T0), d, T0 + MIN);
    expect(s.phase).toBe('focus');
    expect(s.round).toBe(2);
  });
});

describe('자유 모드', () => {
  it('끝이 없고 읽은 시간만 잰다', () => {
    let s = startTimer('free', T0);
    expect(remainingMs(s, d, T0 + 90 * MIN)).toBeNull();
    expect(catchUp(s, d, T0 + 300 * MIN).entered).toEqual([]);
    s = resumeTimer(pauseTimer(s, T0 + 30 * MIN), T0 + 40 * MIN);
    expect(focusMs(s, d, T0 + 70 * MIN)).toBe(60 * MIN);
  });
});
