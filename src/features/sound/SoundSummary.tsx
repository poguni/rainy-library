import { Link } from 'react-router-dom';
import { SoundControls } from '../../theme/parts';
import { useMixer } from './useMixer';

/** 타이머 홈의 '흐르는 소리' 요약(시안 타이머 홈 아래쪽). 켜진 소리만 보여 줍니다. */
export function SoundSummary() {
  const mixer = useMixer();
  const onLayers = mixer.layers.filter((l) => l.on);
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-md font-bold">
          흐르는 소리{mixer.playing ? '' : ' · 꺼짐'}
        </h2>
        <Link to="/sound" className="flex min-h-11 items-center text-sm text-accent">
          믹서 열기
        </Link>
      </div>
      {onLayers.length > 0 ? (
        <SoundControls variant="summary" layers={onLayers} />
      ) : (
        <p className="text-sm text-ink-muted">켜 둔 소리가 없어요. 믹서에서 골라 주세요.</p>
      )}
    </div>
  );
}
