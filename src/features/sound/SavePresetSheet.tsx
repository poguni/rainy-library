import { useState, type FormEvent } from 'react';
import { BottomSheet } from '../../components/BottomSheet';
import type { Preset } from '../../db/types';
import { PlayerIcon } from './PlayerIcon';
import { SOUND_LABEL } from './sounds';
import type { MixerLayerView } from './useMixer';

interface Props {
  layers: MixerLayerView[];
  mine: Preset[];
  onSave: (name: string) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
  onClose: () => void;
}

const MAX_NAME = 20;

/** 지금 조합에 이름을 붙여 저장하고, 내가 만든 프리셋을 지웁니다(M-04). */
export function SavePresetSheet({ layers, mine, onSave, onDelete, onClose }: Props) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string>();
  const on = layers.filter((l) => l.on);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return setError('프리셋 이름을 적어 주세요.');
    await onSave(trimmed);
    onClose();
  };

  return (
    <BottomSheet title="지금 조합 저장" onClose={onClose}>
      <p className="mt-2 text-sm text-ink-muted">
        {on.length > 0
          ? on.map((l) => `${SOUND_LABEL[l.soundId]} ${Math.round(l.volume * 100)}%`).join(' · ')
          : '켜 둔 소리가 없어요.'}
      </p>
      <form onSubmit={submit} noValidate className="mt-4 flex flex-col gap-1.5">
        <label htmlFor="preset-name" className="text-sm">
          프리셋 이름
        </label>
        <input
          id="preset-name"
          value={name}
          maxLength={MAX_NAME}
          placeholder="예: 비 오는 카페"
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? 'preset-name-error' : undefined}
          className="h-12 w-full rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 text-md text-ink"
        />
        {error && (
          <p id="preset-name-error" role="alert" className="text-sm text-ribbon">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="press mt-3 min-h-12 rounded-full bg-accent text-md text-on-accent shadow-[var(--shadow-primary)]"
        >
          저장하기
        </button>
      </form>

      {mine.length > 0 && (
        <div className="mt-6 flex flex-col gap-1">
          <h3 className="text-sm text-ink-muted">내 프리셋</h3>
          <ul className="flex flex-col">
            {mine.map((p) => (
              <li key={p.id} className="flex items-center justify-between border-b border-line">
                <span className="text-md">{p.name}</span>
                <button
                  type="button"
                  aria-label={`${p.name} 지우기`}
                  onClick={() => void onDelete(p.id)}
                  className="flex size-11 items-center justify-center text-ink-muted"
                >
                  <PlayerIcon name="trash" size={20} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </BottomSheet>
  );
}
