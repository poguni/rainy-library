import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BottomSheet } from './BottomSheet';

describe('BottomSheet', () => {
  it('열리면 첫 입력칸에 포커스를 준다', () => {
    render(
      <BottomSheet title="시트" onClose={() => {}}>
        <input aria-label="이름" />
      </BottomSheet>,
    );
    expect(screen.getByLabelText('이름')).toHaveFocus();
  });

  // 부모가 다시 그려져 onClose가 새 함수가 되어도 포커스를 빼앗지 않아야 합니다.
  // (빼앗으면 휴대폰 키보드가 닫혔다 열리며 한글 조합이 끊깁니다.)
  it('onClose가 바뀌어도 입력 중인 칸의 포커스를 유지한다', async () => {
    const sheet = (onClose: () => void) => (
      <BottomSheet title="시트" onClose={onClose}>
        <input aria-label="첫째" />
        <input aria-label="둘째" />
      </BottomSheet>
    );
    const { rerender } = render(sheet(() => {}));
    await userEvent.click(screen.getByLabelText('둘째'));
    rerender(sheet(() => {}));
    expect(screen.getByLabelText('둘째')).toHaveFocus();
  });

  it('Esc를 누르면 가장 최근의 onClose를 부른다', async () => {
    const first = vi.fn();
    const latest = vi.fn();
    const { rerender } = render(
      <BottomSheet title="시트" onClose={first}>
        내용
      </BottomSheet>,
    );
    rerender(
      <BottomSheet title="시트" onClose={latest}>
        내용
      </BottomSheet>,
    );
    await userEvent.keyboard('{Escape}');
    expect(latest).toHaveBeenCalledOnce();
    expect(first).not.toHaveBeenCalled();
  });
});
