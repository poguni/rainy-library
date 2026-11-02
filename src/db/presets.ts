import { newId } from '../lib/id';
import { db } from './db';
import type { Mix, Preset } from './types';

/** 내가 만든 프리셋 목록(이름순) */
export function listUserPresets(): Promise<Preset[]> {
  return db.presets.toArray().then((all) => all.sort((a, b) => a.name.localeCompare(b.name)));
}

export async function addPreset(name: string, mix: Mix): Promise<Preset> {
  const preset: Preset = { id: newId('preset'), name, ...structuredClone(mix) };
  await db.presets.add(preset);
  return preset;
}

export function deletePreset(id: string) {
  return db.presets.delete(id);
}
