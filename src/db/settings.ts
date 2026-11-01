import { db } from './db';
import type { Settings, SettingsRow } from './types';

export const DEFAULT_SETTINGS: Settings = {
  focusMin: 25,
  shortBreakMin: 5,
  longBreakMin: 15,
  wakeLock: true,
  chime: 'bell',
  theme: 'paper',
  autoRule: 'system',
  nightStart: '19:00',
  nightEnd: '07:00',
};

/** 저장된 설정(없으면 기본값) */
export async function getSettings(): Promise<Settings> {
  const row = await db.settings.get('app');
  const saved: Partial<SettingsRow> = { ...row };
  delete saved.key;
  return { ...DEFAULT_SETTINGS, ...saved };
}

export async function updateSettings(patch: Partial<Settings>) {
  await db.settings.put({ ...(await getSettings()), ...patch, key: 'app' });
}
