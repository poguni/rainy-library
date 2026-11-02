import { SoundIcon } from '../../../features/sound/SoundIcon';
import { MedalMixer } from '../MedalMixer';

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

  // 사운드 탭은 두 테마가 같은 메달 방식을 씁니다(2026-11-02 통일).
  return <MedalMixer layers={layers} onToggle={onToggle} onVolume={onVolume} />;
}
