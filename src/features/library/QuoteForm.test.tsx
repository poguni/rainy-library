import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuoteForm } from './QuoteForm';

function setup(defaultPage?: number) {
  const onSave = vi.fn().mockResolvedValue(undefined);
  render(<QuoteForm totalPages={200} defaultPage={defaultPage} onSave={onSave} />);
  return { onSave };
}

describe('QuoteForm', () => {
  it('문장이 비면 저장하지 않고 안내한다', async () => {
    const { onSave } = setup();
    await userEvent.click(screen.getByRole('button', { name: '남기기' }));
    expect(screen.getByRole('alert')).toHaveTextContent('남기고 싶은 문장을 적어 주세요.');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('쪽수 없이도 남길 수 있다', async () => {
    const { onSave } = setup();
    await userEvent.type(screen.getByLabelText('문장'), '새는 알에서 나오려고 투쟁한다.');
    await userEvent.click(screen.getByRole('button', { name: '남기기' }));
    expect(onSave).toHaveBeenCalledWith('새는 알에서 나오려고 투쟁한다.', undefined);
  });

  it('미리 넣은 쪽수로 남기고, 범위를 넘으면 안내한다', async () => {
    const { onSave } = setup(42);
    expect(screen.getByLabelText('쪽수(선택)')).toHaveValue('42');
    await userEvent.type(screen.getByLabelText('문장'), '한 문장');
    await userEvent.click(screen.getByRole('button', { name: '남기기' }));
    expect(onSave).toHaveBeenCalledWith('한 문장', 42);

    await userEvent.clear(screen.getByLabelText('쪽수(선택)'));
    await userEvent.type(screen.getByLabelText('쪽수(선택)'), '201');
    await userEvent.click(screen.getByRole('button', { name: '남기기' }));
    expect(screen.getByRole('alert')).toHaveTextContent('쪽수는 1~200 사이로');
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
