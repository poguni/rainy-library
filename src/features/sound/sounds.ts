import type { Mix } from '../../db/types';

export type SoundId = 'rain' | 'rain2' | 'fire' | 'cafe' | 'crickets';

export interface SoundInfo {
  id: SoundId;
  label: string;
  url: string;
}

// 파일은 scripts/prepare-sounds.sh로 다듬은 것(−23 LUFS, AAC 96kbps). 원본은 sound-originals/에 있습니다.
// AAC(m4a)는 크롬·사파리·엣지·삼성 인터넷에서 모두 재생됩니다.
// id 'rain'은 예전 데이터(시드·저장된 믹서·프리셋)와 맞추려고 그대로 둡니다.
export const SOUNDS: SoundInfo[] = [
  {
    id: 'rain',
    label: '창밖 빗소리',
    url: new URL('../../assets/sounds/rain_1.m4a', import.meta.url).href,
  },
  {
    id: 'rain2',
    label: '처마 끝 빗소리',
    url: new URL('../../assets/sounds/rain_2.m4a', import.meta.url).href,
  },
  {
    id: 'fire',
    label: '장작',
    url: new URL('../../assets/sounds/fire.m4a', import.meta.url).href,
  },
  {
    id: 'cafe',
    label: '카페',
    url: new URL('../../assets/sounds/cafe.m4a', import.meta.url).href,
  },
  {
    id: 'crickets',
    label: '귀뚜라미',
    url: new URL('../../assets/sounds/crickets.m4a', import.meta.url).href,
  },
];

export const SOUND_LABEL: Record<string, string> = Object.fromEntries(
  SOUNDS.map((s) => [s.id, s.label]),
);

/** 처음 쓰는 사람의 조합: 기본 프리셋 '비 오는 밤'과 같음(새 소리는 꺼진 채로) */
export const DEFAULT_MIX: Mix = {
  layers: [
    { soundId: 'rain', volume: 0.6, on: true },
    { soundId: 'rain2', volume: 0.5, on: false },
    { soundId: 'fire', volume: 0.25, on: true },
    { soundId: 'cafe', volume: 0.3, on: false },
    { soundId: 'crickets', volume: 0.3, on: false },
  ],
  masterVolume: 0.8,
};

/**
 * 저장된 조합(예전 3종짜리 포함)을 지금 소리 목록에 맞춥니다.
 * 목록 순서대로, 없는 소리는 기본값(꺼짐)으로 채우고, 없어진 소리는 뺍니다.
 */
export function normalizeMix(mix: Mix): Mix {
  const layers = SOUNDS.map((s) => {
    const saved = mix.layers.find((l) => l.soundId === s.id);
    return saved ?? DEFAULT_MIX.layers.find((l) => l.soundId === s.id)!;
  });
  return { layers, masterVolume: mix.masterVolume };
}

/** 휴식 중 소리 크기(집중 대비 비율) */
export const BREAK_LEVEL = 0.3;
