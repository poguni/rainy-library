import { Medal, MedalMixer } from '../MedalMixer';
import type { SoundControlsProps } from '../paper/SoundControls';

const pct = (v: number) => Math.round(v * 100);

/** 에메랄드 서재 환경음 컨트롤(DESIGN.md 8.2): 요약은 작은 메달 4열, 사운드 탭은 공용 MedalMixer */
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

  return <MedalMixer layers={layers} onToggle={onToggle} onVolume={onVolume} />;
}
