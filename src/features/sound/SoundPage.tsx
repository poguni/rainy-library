import { useState } from 'react';
import { VolumeSlider } from '../../components/VolumeSlider';
import { SoundControls } from '../../theme/parts';
import { useTimer } from '../timer/timerContext';
import { MusicPanel } from './MusicPanel';
import { PresetChips } from './PresetChips';
import { SavePresetSheet } from './SavePresetSheet';
import { SOUNDS } from './sounds';
import { useMixer } from './useMixer';
import { usePresets } from './usePresets';

export function SoundPage() {
  const mixer = useMixer();
  const timerOn = !!useTimer().active;
  const presets = usePresets();
  const [saving, setSaving] = useState(false);
  const master = Math.round(mixer.mix.masterVolume * 100);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-0.5">
        <h1 className="font-display text-xl font-bold">흐르는 소리</h1>
        {presets.active && (
          <p className="font-display text-md text-accent">{presets.active.name}</p>
        )}
        <p className="text-sm text-ink-muted">
          {timerOn
            ? '타이머에 맞춰 쉬는 시간엔 작게, 집중할 땐 다시 커져요.'
            : '켜고 싶은 소리를 골라 섞어 보세요.'}
        </p>
      </div>

      <button
        type="button"
        onClick={mixer.togglePlay}
        aria-pressed={mixer.playing}
        className="press flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent text-md text-on-accent shadow-[var(--shadow-primary)]"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={mixer.playing ? 2.4 : 1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {mixer.playing ? <path d="M9 6v12M15 6v12" /> : <path d="M8 5l11 7-11 7z" />}
        </svg>
        {mixer.playing ? '소리 멈추기' : '소리 켜기'}
      </button>
      <p role="status" className="-mt-3 min-h-5 text-center text-sm text-ink-muted">
        {mixer.error ?? (mixer.loading ? '소리를 불러오는 중이에요…' : '')}
      </p>

      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-md font-bold">프리셋</h2>
          <button
            type="button"
            onClick={() => setSaving(true)}
            className="flex min-h-11 items-center text-sm text-accent"
          >
            지금 조합 저장
          </button>
        </div>
        <PresetChips
          presets={presets.presets}
          activeId={presets.active?.id}
          onPick={presets.apply}
        />
      </div>

      <SoundControls
        variant="full"
        layers={mixer.layers}
        onToggle={mixer.toggle}
        onVolume={mixer.setVolume}
      />

      <div className="flex flex-col gap-1 rounded-[var(--radius-lg)] border border-line bg-surface px-4 pt-3 pb-1">
        <label htmlFor="master-volume" className="text-md">
          전체 음량
        </label>
        <div className="flex items-center gap-3">
          <VolumeSlider
            id="master-volume"
            value={master}
            onChange={(v) => mixer.setMaster(v / 100)}
            className="grow"
          />
          <span className="w-10 text-right text-sm text-ink-muted tabular-nums">{master}%</span>
        </div>
      </div>

      <MusicPanel />

      <ul aria-label="소리 출처" className="flex flex-col gap-0.5 px-1 text-sm text-ink-muted">
        {SOUNDS.map((s) => (
          <li key={s.id}>
            {s.label}: [출처] 유튜브 {s.source}
          </li>
        ))}
      </ul>

      {saving && (
        <SavePresetSheet
          layers={mixer.layers}
          mine={presets.mine}
          onSave={presets.save}
          onDelete={presets.remove}
          onClose={() => setSaving(false)}
        />
      )}
    </section>
  );
}
