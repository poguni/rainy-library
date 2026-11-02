import { addPreset, deletePreset } from '../../db/presets';
import { useLiveQuery } from '../../db/useLiveQuery';
import { soundEngine } from './engine';
import { DEFAULT_PRESETS, findPreset, isDefaultPreset, listPresets } from './presets';
import { useMixer } from './useMixer';

/** 프리셋 목록과 지금 조합에 맞는 프리셋(M-04, M-05) */
export function usePresets() {
  const { mix } = useMixer();
  const presets = useLiveQuery(listPresets, []) ?? DEFAULT_PRESETS;
  const active = findPreset(presets, mix);
  return {
    presets,
    active,
    mine: presets.filter((p) => !isDefaultPreset(p.id)),
    apply: (id: string) => {
      const p = presets.find((x) => x.id === id);
      if (p) soundEngine.applyPreset(p);
    },
    save: (name: string) => addPreset(name, mix),
    remove: (id: string) => deletePreset(id),
  };
}
