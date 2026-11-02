import type { Mix } from '../db/types';

const EPS = 0.005; // 슬라이더 1% 미만 차이는 같은 것으로

/** 실제로 들리는 음량(꺼졌으면 0) */
function heard(mix: Mix, soundId: string): number {
  const l = mix.layers.find((x) => x.soundId === soundId);
  return l?.on ? l.volume : 0;
}

/** 두 조합이 귀로 듣기에 같은지(꺼진 소리의 슬라이더 위치는 따지지 않음) */
export function sameMix(a: Mix, b: Mix): boolean {
  if (Math.abs(a.masterVolume - b.masterVolume) > EPS) return false;
  const ids = new Set([...a.layers, ...b.layers].map((l) => l.soundId));
  return [...ids].every((id) => Math.abs(heard(a, id) - heard(b, id)) <= EPS);
}
