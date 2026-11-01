import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddBookSheet } from './AddBookSheet';

function setup() {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  const onClose = vi.fn();
  render(<AddBookSheet onSubmit={onSubmit} onClose={onClose} />);
  return { onSubmit, onClose, user: userEvent.setup() };
}

describe('책 추가 시트', () => {
  it('제목과 쪽수가 비어 있으면 경고하고 저장하지 않는다', async () => {
    const { onSubmit, user } = setup();
    await user.click(screen.getByRole('button', { name: '책 추가' }));
    expect(screen.getByText('책 제목을 적어 주세요.')).toBeInTheDocument();
    expect(screen.getByText('전체 쪽수를 1 이상의 숫자로 적어 주세요.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('쪽수 칸에는 숫자만 들어간다', async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText('전체 쪽수 (필수)'), '2a4-8');
    expect(screen.getByLabelText('전체 쪽수 (필수)')).toHaveValue('248');
  });

  it('올바르게 적으면 저장하고 닫는다', async () => {
    const { onSubmit, onClose, user } = setup();
    await user.type(screen.getByLabelText('제목 (필수)'), '  데미안 ');
    await user.type(screen.getByLabelText('저자'), '헤르만 헤세');
    await user.type(screen.getByLabelText('전체 쪽수 (필수)'), '248');
    await user.click(screen.getByRole('button', { name: '책 추가' }));
    expect(onSubmit).toHaveBeenCalledWith({
      title: '데미안',
      author: '헤르만 헤세',
      totalPages: 248,
      coverBlob: undefined,
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('Esc를 누르면 닫힌다', async () => {
    const { onClose, user } = setup();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});
