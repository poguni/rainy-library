import { sameMix } from './mix';

const base = {
  layers: [
    { soundId: 'rain', volume: 0.6, on: true },
    { soundId: 'fire', volume: 0.3, on: false },
  ],
  masterVolume: 0.8,
};

describe('sameMix', () => {
  it('같은 조합', () => {
    expect(sameMix(base, structuredClone(base))).toBe(true);
  });
  it('꺼진 소리의 음량 차이와 빠진 소리(꺼짐)는 무시한다', () => {
    expect(
      sameMix(base, { layers: [{ soundId: 'rain', volume: 0.6, on: true }], masterVolume: 0.8 }),
    ).toBe(true);
  });
  it('켜진 소리 음량이나 마스터가 다르면 다르다', () => {
    expect(
      sameMix(base, { ...base, layers: [{ soundId: 'rain', volume: 0.5, on: true }] }),
    ).toBe(false);
    expect(sameMix(base, { ...base, masterVolume: 0.5 })).toBe(false);
  });
  it('1% 미만 차이는 같다고 본다', () => {
    expect(
      sameMix(base, { ...base, layers: [{ soundId: 'rain', volume: 0.603, on: true }] }),
    ).toBe(true);
  });
});
