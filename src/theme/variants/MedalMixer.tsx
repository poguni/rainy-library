import { VolumeSlider } from '../../components/VolumeSlider';
import { SoundIcon } from '../../features/sound/SoundIcon';
import type { SoundControlsProps } from './paper/SoundControls';

const pct = (v: number) => Math.round(v * 100);

/** 메달: 원판 + 둘레 강조색 호가 음량. 꺼지면 투명도 50%, 호 없음 */
export function Medal({
  soundId,
  volume,
  on,
  size,
}: {
  soundId: string;
  volume: number;
  on: boolean;
  size: number;
}) {
  const r = size / 2 - 3;
  const c = 2 * Math.PI * r;
  const mid = size / 2;
  return (
    <div className={`relative ${on ? '' : 'opacity-50'}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={mid}
          cy={mid}
          r={r}
          fill="var(--color-surface)"
          stroke="var(--color-accent-tint)"
          strokeWidth="2"
        />
        {on && volume > 0 && (
          <circle
            cx={mid}
            cy={mid}
            r={r}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${volume * c} ${c}`}
            transform={`rotate(-90 ${mid} ${mid})`}
          />
        )}
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-accent-strong">
        <SoundIcon id={soundId} size={size > 70 ? 28 : 22} />
      </span>
    </div>
  );
}

/**
 * 사운드 탭의 소리 섞기(두 테마 공통, 2026-11-02 에메랄드 방식으로 통일):
 * 큰 메달 2열, 메달을 누르면 켜기/끄기, 아래 슬라이더는 손잡이를 끌 때만 움직입니다.
 */
export function MedalMixer({
  layers,
  onToggle,
  onVolume,
}: Pick<SoundControlsProps, 'layers' | 'onToggle' | 'onVolume'>) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-4">
      {layers.map((l) => (
        <li key={l.soundId} className="flex flex-col items-center gap-1">
          <button
            type="button"
            role="switch"
            aria-checked={l.on}
            aria-label={`${l.label} 켜기`}
            onClick={() => onToggle?.(l.soundId)}
            className="press flex flex-col items-center gap-1.5 rounded-full"
          >
            <Medal soundId={l.soundId} volume={l.volume} on={l.on} size={88} />
            <span className={`text-sm ${l.on ? 'text-ink' : 'text-ink-muted'}`}>
              {l.label}{' '}
              <span className="font-numeral text-md text-ink-strong">
                {l.on ? pct(l.volume) : '—'}
              </span>
            </span>
          </button>
          <VolumeSlider
            value={pct(l.volume)}
            label={`${l.label} 음량`}
            dimmed={!l.on}
            onChange={(v) => onVolume?.(l.soundId, v / 100)}
            className="w-full"
          />
        </li>
      ))}
    </ul>
  );
}
