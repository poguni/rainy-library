import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EndSessionSheet } from './EndSessionSheet';

function setup() {
  const onSave = vi.fn().mockResolvedValue(undefined);
  const onClose = vi.fn();
  render(
    <EndSessionSheet
      bookTitle="데미안"
      totalPages={248}
      startPage={120}
      focusSec={3000}
      onSave={onSave}
      onClose={onClose}
    />,
  );
  const input = screen.getByLabelText('어디까지 읽었나요?');
  return { onSave, onClose, input, user: userEvent.setup() };
}

describe('세션 종료 시트', () => {
  it('읽은 시간과 시작 쪽수를 보여 주고, 끝 쪽수 기본값은 시작 쪽수', () => {
    const { input } = setup();
    expect(screen.getByText(/120쪽부터/)).toBeInTheDocument();
    expect(screen.getByText('50분')).toBeInTheDocument();
    expect(input).toHaveValue('120');
  });

  it('끝 쪽수가 시작 쪽수보다 작으면 경고하고 저장하지 않는다', async () => {
    const { onSave, input, user } = setup();
    await user.clear(input);
    await user.type(input, '119');
    expect(screen.getByRole('alert')).toHaveTextContent('시작 쪽수(120쪽)보다 작을 수 없어요.');
    await user.click(screen.getByRole('button', { name: '기록하기' }));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('끝 쪽수가 전체 쪽수보다 크면 경고', async () => {
    const { onSave, input, user } = setup();
    await user.clear(input);
    await user.type(input, '249');
    expect(screen.getByRole('alert')).toHaveTextContent('이 책은 248쪽까지 있어요.');
    await user.click(screen.getByRole('button', { name: '기록하기' }));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('+ 버튼과 올바른 쪽수로 저장', async () => {
    const { onSave, input, user } = setup();
    await user.clear(input);
    await user.type(input, '141');
    await user.click(screen.getByRole('button', { name: '어디까지 읽었나요? 1쪽 늘리기' }));
    await user.click(screen.getByRole('button', { name: '기록하기' }));
    expect(onSave).toHaveBeenCalledWith(142);
  });

  it('쪽수 없이 시간만 기록할 수 있다(P-02)', async () => {
    const { onSave, user } = setup();
    await user.click(screen.getByRole('button', { name: '쪽수 없이 시간만 기록하기' }));
    expect(onSave).toHaveBeenCalledWith(null);
  });

  it('계속 읽기를 누르면 닫힌다', async () => {
    const { onClose, user } = setup();
    await user.click(screen.getByRole('button', { name: '계속 읽기' }));
    expect(onClose).toHaveBeenCalled();
  });
});
