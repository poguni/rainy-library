import { SoundIcon } from '../../../features/sound/SoundIcon';

export interface SoundControlLayer {
  soundId: string;
  label: string;
  /** 0~1 */
  volume: number;
  on: boolean;
}

export interface SoundControlsProps {
  layers: SoundControlLayer[];
  /** summary: 타이머 홈 요약 / full: 사운드 탭 */
  variant: 'summary' | 'full';
  onToggle?: (soundId: string) => void;
  onVolume?: (soundId: string, volume: number) => void;
}

const pct = (v: number) => Math.round(v * 100);

/** 종이 서재 환경음 컨트롤(DESIGN.md 8.2) */
export function SoundControls({ layers, variant, onToggle, onVolume }: SoundControlsProps) {
  if (variant === 'summary') {
    return (
      <ul className="grid grid-cols-3 gap-2">
        {layers.map((l) => (
          <li
            key={l.soundId}
            className={`flex flex-col gap-2 rounded-[var(--radius-md)] border border-line bg-surface p-2.5 ${
              l.on ? 'text-ink' : 'text-ink-muted'
            }`}
          >
            <div className="flex items-center gap-1.5 text-sm">
              <SoundIcon id={l.soundId} />
              {l.label}
            </div>
            <div aria-hidden="true" className="h-1 rounded-sm bg-line">
              {l.on && (
                <div className="h-1 rounded-sm bg-accent" style={{ width: `${pct(l.volume)}%` }} />
              )}
            </div>
            <div className="text-xs text-ink-muted">{l.on ? `${pct(l.volume)}%` : '꺼짐'}</div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {layers.map((l) => (
        <li
          key={l.soundId}
          className="flex flex-col gap-1 rounded-[var(--radius-lg)] border border-line bg-surface px-4 pt-2 pb-1"
        >
          <div className={`flex items-center gap-2.5 ${l.on ? 'text-ink' : 'text-ink-muted'}`}>
            <SoundIcon id={l.soundId} size={22} />
            <span className="grow text-md">{l.label}</span>
            <button
              type="button"
              role="switch"
              aria-checked={l.on}
              aria-label={`${l.label} 켜기`}
              onClick={() => onToggle?.(l.soundId)}
              className="flex min-h-11 items-center"
            >
              <span
                aria-hidden="true"
                className={`relative h-7 w-12 rounded-full transition-colors duration-150 ${
                  l.on ? 'bg-accent' : 'bg-line-strong'
                }`}
              >
                <span
                  className={`absolute top-1 size-5 rounded-full bg-surface-raised transition-[left] duration-150 ${
                    l.on ? 'left-6' : 'left-1'
                  }`}
                />
              </span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              value={pct(l.volume)}
              aria-label={`${l.label} 음량`}
              onChange={(e) => onVolume?.(l.soundId, Number(e.target.value) / 100)}
              className={`h-11 grow accent-accent ${l.on ? '' : 'opacity-50'}`}
            />
            <span className="w-10 text-right text-sm text-ink-muted tabular-nums">
              {pct(l.volume)}%
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
