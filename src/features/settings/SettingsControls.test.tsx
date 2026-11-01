import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_SETTINGS } from '../../db/settings';
import { ChimeSettings } from './ChimeSettings';
import { ScreenSettings } from './ScreenSettings';
import { TimerSettings } from './TimerSettings';

const update = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
vi.mock('../../db/settings', async (orig) => ({
  ...(await orig<typeof import('../../db/settings')>()),
  updateSettings: update,
}));

beforeEach(() => update.mockClear());

describe('설정 화면', () => {
  it('알림음을 고르면 저장을 기다리지 않고 바로 선택된다', async () => {
    render(<ChimeSettings settings={DEFAULT_SETTINGS} />);
    await userEvent.click(screen.getByRole('radio', { name: '나무 실로폰' }));
    expect(screen.getByRole('radio', { name: '나무 실로폰' })).toBeChecked();
    expect(update).toHaveBeenCalledWith({ chime: 'wood' });
  });

  it('화면 켜 두기 스위치도 바로 바뀐다', async () => {
    render(<ScreenSettings settings={DEFAULT_SETTINGS} />);
    const sw = screen.getByRole('switch', { name: '읽는 동안 화면 켜 두기' });
    expect(sw).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(sw);
    expect(sw).toHaveAttribute('aria-checked', 'false');
    expect(update).toHaveBeenCalledWith({ wakeLock: false });
  });

  it('타이머 시간은 범위 밖이면 경고만 하고 저장하지 않는다', async () => {
    render(<TimerSettings settings={DEFAULT_SETTINGS} />);
    const focus = screen.getByLabelText('집중 시간');
    await userEvent.clear(focus);
    await userEvent.type(focus, '4');
    expect(screen.getByRole('alert')).toHaveTextContent('5분에서 90분 사이로 적어 주세요.');
    expect(update).not.toHaveBeenCalled();
    await userEvent.type(focus, '0');
    expect(update).toHaveBeenLastCalledWith({ focusMin: 40 });
  });
});
