import { Link } from 'react-router-dom';
import { SoundControls } from '../../theme/parts';
import { PresetChips } from './PresetChips';
import { useMixer } from './useMixer';
import { useMusic } from './useMusic';
import { usePresets } from './usePresets';

/** 타이머 홈의 '흐르는 소리' 요약(시안 타이머 홈 아래쪽). 켜진 소리만 보여 줍니다. */
export function SoundSummary() {
  const mixer = useMixer();
  const presets = usePresets();
  const music = useMusic();
  const onLayers = mixer.layers.filter((l) => l.on);
  const title = presets.active ? ` · ${presets.active.name}` : '';
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-md font-bold">
          흐르는 소리{mixer.playing ? title : ' · 꺼짐'}
        </h2>
        <Link to="/sound" className="flex min-h-11 items-center text-sm text-accent">
          믹서 열기
        </Link>
      </div>
      <PresetChips presets={presets.presets} activeId={presets.active?.id} onPick={presets.apply} />
      {onLayers.length > 0 ? (
        <SoundControls variant="summary" layers={onLayers} />
      ) : (
        <p className="text-sm text-ink-muted">켜 둔 소리가 없어요. 믹서에서 골라 주세요.</p>
      )}
      {music.current && (
        <p className="truncate text-sm text-ink-muted">
          {music.playing ? '함께 듣는 음악' : '멈춘 음악'} · {music.current.name}
        </p>
      )}
    </div>
  );
}
