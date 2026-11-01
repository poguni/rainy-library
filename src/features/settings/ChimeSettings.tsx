import { useState } from 'react';
import { updateSettings } from '../../db/settings';
import type { Settings } from '../../db/types';
import { unlockAudio } from '../sound/audioContext';
import { CHIME_OPTIONS, playChime, toChimeStyle, type ChimeStyle } from '../timer/chime';

/** 알림음 종류(T-05, W-05) */
export function ChimeSettings({ settings }: { settings: Settings }) {
  // 누르자마자 화면에 보이도록 먼저 바꾸고, 저장은 뒤에서 합니다.
  const [style, setStyle] = useState(() => toChimeStyle(settings.chime));
  const choose = (value: ChimeStyle) => {
    setStyle(value);
    void updateSettings({ chime: value });
  };

  const preview = async () => {
    await unlockAudio();
    playChime('focusEnd', style);
  };

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="font-display text-md font-bold">알림음</legend>
      <p className="text-sm text-ink-muted">집중과 휴식이 바뀔 때 울려요.</p>
      <div className="flex flex-col">
        {CHIME_OPTIONS.map((o) => (
          <label key={o.value} className="flex min-h-11 items-center gap-3 text-md">
            <input
              type="radio"
              name="chime"
              value={o.value}
              checked={style === o.value}
              onChange={() => choose(o.value)}
              className="size-5 accent-accent"
            />
            {o.label}
          </label>
        ))}
      </div>
      <button
        type="button"
        onClick={() => void preview()}
        disabled={style === 'none'}
        className="press min-h-11 self-start rounded-full border border-line-strong bg-surface px-4 text-md disabled:opacity-50"
      >
        들어 보기
      </button>
    </fieldset>
  );
}
