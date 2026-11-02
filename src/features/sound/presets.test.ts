import seed from '../../../docs/seed-data.json';
import { DEFAULT_PRESETS, findPreset, isDefaultPreset } from './presets';
import { DEFAULT_MIX, normalizeMix } from './sounds';

describe('기본 프리셋', () => {
  it('3개이고 이름이 PRD M-05와 같다', () => {
    expect(DEFAULT_PRESETS.map((p) => p.name)).toEqual(['비 오는 밤', '북카페', '산장의 벽난로']);
    expect(DEFAULT_PRESETS.every((p) => isDefaultPreset(p.id))).toBe(true);
  });

  it('시드 데이터의 프리셋(예전 3종 조합)과 같은 조합으로 알아본다', () => {
    for (const p of seed.presets) {
      expect(findPreset(DEFAULT_PRESETS, normalizeMix(p))?.id).toBe(p.id);
    }
  });

  it('처음 조합은 비 오는 밤', () => {
    expect(findPreset(DEFAULT_PRESETS, DEFAULT_MIX)?.name).toBe('비 오는 밤');
  });

  it('조합을 조금이라도 바꾸면 맞는 프리셋이 없다', () => {
    const changed = { ...DEFAULT_MIX, masterVolume: 0.5 };
    expect(findPreset(DEFAULT_PRESETS, changed)).toBeUndefined();
  });
});
