import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookSpine, FinishCard, SoundControls, TimerFace } from './parts';

const setTheme = (t: string) => act(() => document.documentElement.setAttribute('data-theme', t));
// MutationObserver 알림은 마이크로태스크라 한 번 기다립니다.
const flush = () => act(() => Promise.resolve());

const timer = {
  mode: 'pomodoro' as const,
  phase: 'focus' as const,
  displaySec: 1122,
  totalSec: 1500,
  round: 2,
  rounds: 4,
  paused: false,
};

const layers = [
  { soundId: 'rain', label: '창밖 빗소리', volume: 0.6, on: true },
  { soundId: 'fire', label: '장작', volume: 0.25, on: false },
];

afterEach(() => document.documentElement.setAttribute('data-theme', 'paper'));

describe.each(['paper', 'emerald'])('테마 전용 부품 (%s)', (theme) => {
  beforeEach(async () => {
    setTheme(theme);
    await flush();
  });

  it('타이머: 같은 남은 시간을 같은 이름으로 알려 준다', () => {
    render(<TimerFace {...timer} />);
    expect(screen.getByRole('timer')).toHaveTextContent('18:42');
    expect(screen.getByText(/집중 시간 · 2 \/ 4회차/)).toBeInTheDocument();
  });

  it('환경음: 같은 스위치·슬라이더가 있고 같은 동작을 부른다', async () => {
    const onToggle = vi.fn();
    const onVolume = vi.fn();
    render(
      <SoundControls variant="full" layers={layers} onToggle={onToggle} onVolume={onVolume} />,
    );
    await userEvent.click(screen.getByRole('switch', { name: '장작 켜기' }));
    expect(onToggle).toHaveBeenCalledWith('fire');
    expect(screen.getByRole('slider', { name: '창밖 빗소리 음량' })).toHaveValue('60');
  });

  it('완독 예상일: 기록이 부족하면 같은 안내', () => {
    render(
      <FinishCard
        date={null}
        remainingMin={0}
        note="기록이 더 쌓이면 알려 드릴게요"
        dateText=""
        remainingText=""
      />,
    );
    expect(screen.getByText('기록이 더 쌓이면 알려 드릴게요')).toBeInTheDocument();
  });

  it('책등: 눌림 상태와 선택 동작이 같다', async () => {
    const onSelect = vi.fn();
    const look = { colorIndex: 1, darkInk: false, width: 30, height: 100 };
    render(<BookSpine title="데미안" look={look} selected leaning={false} onSelect={onSelect} />);
    const spine = screen.getByRole('button', { name: '데미안' });
    expect(spine).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(spine);
    expect(onSelect).toHaveBeenCalled();
  });
});

describe('테마 바꾸기', () => {
  it('data-theme이 바뀌면 그 테마의 부품으로 다시 그린다', async () => {
    render(<TimerFace {...timer} />);
    expect(screen.queryByText('FOCUS · II / IV')).not.toBeInTheDocument();
    setTheme('emerald');
    await flush();
    expect(screen.getByText('FOCUS · II / IV')).toBeInTheDocument();
  });
});
