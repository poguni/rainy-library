import { listUserPresets } from '../../db/presets';
import type { Mix, Preset } from '../../db/types';
import { sameMix } from '../../lib/mix';
import { soundEngine } from './engine';
import { DEFAULT_MIX, normalizeMix, SOUNDS } from './sounds';

/** 적은 소리만 켜고 나머지는 모두 끈 조합 */
const mix = (on: Record<string, number>): Mix => ({
  layers: SOUNDS.map((s) => ({ soundId: s.id, volume: on[s.id] ?? 0, on: s.id in on })),
  masterVolume: 0.8,
});

/** 기본 프리셋 3개(M-05). 코드에 고정되어 지울 수 없습니다. ID는 docs/seed-data.json과 같습니다. */
export const DEFAULT_PRESETS: Preset[] = [
  { id: 'preset_rainy_night', name: '비 오는 밤', ...DEFAULT_MIX },
  { id: 'preset_book_cafe', name: '북카페', ...mix({ rain: 0.2, cafe: 0.6 }) },
  { id: 'preset_cabin_fire', name: '산장의 벽난로', ...mix({ rain: 0.3, fire: 0.7 }) },
];

const DEFAULT_IDS = new Set(DEFAULT_PRESETS.map((p) => p.id));

export const isDefaultPreset = (id: string) => DEFAULT_IDS.has(id);

/** 기본 프리셋 + 내가 만든 프리셋(기본과 같은 ID는 빼서 겹치지 않게) */
export async function listPresets(): Promise<Preset[]> {
  const mine = (await listUserPresets()).filter((p) => !isDefaultPreset(p.id));
  return [...DEFAULT_PRESETS, ...mine];
}

/** 지금 조합과 같은 프리셋(없으면 undefined) */
export function findPreset(presets: Preset[], current: Mix): Preset | undefined {
  return presets.find((p) => sameMix(normalizeMix(p), current));
}

/** 세션 기록용: 지금 믹서 조합에 맞는 프리셋 ID */
export async function currentPresetId(): Promise<string | undefined> {
  const presets = await listPresets().catch(() => DEFAULT_PRESETS);
  return findPreset(presets, soundEngine.getSnapshot().mix)?.id;
}
