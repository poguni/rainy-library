import { SoundIcon } from '../../../features/sound/SoundIcon';
import type { SoundControlsProps } from '../paper/SoundControls';

const pct = (v: number) => Math.round(v * 100);

/** 메달: 원판 + 둘레 금색 호가 음량. 꺼지면 투명도 50%, 호 없음 */
function Medal({
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

/** 에메랄드 서재 환경음 컨트롤(DESIGN.md 8.2): 요약은 작은 메달 4열, 사운드 탭은 큰 메달 2열 + 슬라이더 */
export function SoundControls({ layers, variant, onToggle, onVolume }: SoundControlsProps) {
  if (variant === 'summary') {
    return (
      <ul className="grid grid-cols-4 gap-1.5">
        {layers.map((l) => (
          <li key={l.soundId} className="flex flex-col items-center gap-1">
            <Medal soundId={l.soundId} volume={l.volume} on={l.on} size={62} />
            <span className="text-center text-xs">
              {l.label} {l.on ? pct(l.volume) : '꺼짐'}
            </span>
          </li>
        ))}
      </ul>
    );
  }

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
          <input
            type="range"
            min={0}
            max={100}
            value={pct(l.volume)}
            aria-label={`${l.label} 음량`}
            onChange={(e) => onVolume?.(l.soundId, Number(e.target.value) / 100)}
            className={`h-11 w-full accent-accent ${l.on ? '' : 'opacity-50'}`}
          />
        </li>
      ))}
    </ul>
  );
}
