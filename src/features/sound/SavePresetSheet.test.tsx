import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SavePresetSheet } from './SavePresetSheet';

const layers = [
  { soundId: 'rain', label: '창밖 빗소리', volume: 0.6, on: true },
  { soundId: 'fire', label: '장작', volume: 0.2, on: false },
];

function setup(mine = [] as { id: string; name: string; layers: []; masterVolume: number }[]) {
  const onSave = vi.fn().mockResolvedValue(undefined);
  const onDelete = vi.fn().mockResolvedValue(undefined);
  const onClose = vi.fn();
  render(
    <SavePresetSheet
      layers={layers}
      mine={mine}
      onSave={onSave}
      onDelete={onDelete}
      onClose={onClose}
    />,
  );
  return { onSave, onDelete, onClose };
}

describe('SavePresetSheet', () => {
  it('켜진 소리만 요약해 보여 준다', () => {
    setup();
    expect(screen.getByText('창밖 빗소리 60%')).toBeInTheDocument();
  });

  it('이름이 비어 있으면 저장하지 않고 안내한다', async () => {
    const { onSave } = setup();
    await userEvent.click(screen.getByRole('button', { name: '저장하기' }));
    expect(screen.getByRole('alert')).toHaveTextContent('프리셋 이름을 적어 주세요.');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('앞뒤 공백을 지운 이름으로 저장하고 닫는다', async () => {
    const { onSave, onClose } = setup();
    await userEvent.type(screen.getByLabelText('프리셋 이름'), '  비 오는 카페 ');
    await userEvent.click(screen.getByRole('button', { name: '저장하기' }));
    expect(onSave).toHaveBeenCalledWith('비 오는 카페');
    expect(onClose).toHaveBeenCalled();
  });

  it('내 프리셋을 지울 수 있다', async () => {
    const { onDelete } = setup([{ id: 'preset_x', name: '새벽', layers: [], masterVolume: 1 }]);
    await userEvent.click(screen.getByRole('button', { name: '새벽 지우기' }));
    expect(onDelete).toHaveBeenCalledWith('preset_x');
  });
});
