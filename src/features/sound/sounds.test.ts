import { DEFAULT_MIX, normalizeMix, SOUNDS } from './sounds';

describe('normalizeMix', () => {
  it('예전 3종 조합에 새 소리를 꺼진 채로 더하고, 목록 순서로 맞춘다', () => {
    const old = {
      layers: [
        { soundId: 'cafe', volume: 0.6, on: true },
        { soundId: 'rain', volume: 0.2, on: true },
        { soundId: 'fire', volume: 0, on: false },
      ],
      masterVolume: 0.7,
    };
    const mix = normalizeMix(old);
    expect(mix.layers.map((l) => l.soundId)).toEqual(SOUNDS.map((s) => s.id));
    expect(mix.layers.find((l) => l.soundId === 'cafe')).toEqual(old.layers[0]);
    expect(mix.layers.find((l) => l.soundId === 'crickets')?.on).toBe(false);
    expect(mix.masterVolume).toBe(0.7);
  });

  it('없어진 소리는 뺀다', () => {
    const mix = normalizeMix({
      layers: [...DEFAULT_MIX.layers, { soundId: 'waves', volume: 1, on: true }],
      masterVolume: 1,
    });
    expect(mix.layers.some((l) => l.soundId === 'waves')).toBe(false);
  });

  it('기본 조합은 이미 맞춰져 있다', () => {
    expect(normalizeMix(DEFAULT_MIX)).toEqual(DEFAULT_MIX);
  });
});
