import { newId } from '../lib/id';
import { db } from './db';
import type { Track } from './types';

/** 재생 목록(불러온 순서) */
export function listTracks(): Promise<Track[]> {
  return db.tracks.orderBy('order').toArray();
}

/** 곡을 목록 끝에 덧붙입니다. 파일은 이 기기(IndexedDB)에만 저장됩니다(L-04). */
export async function addTracks(items: { name: string; fileBlob: Blob; duration: number }[]) {
  const last = await db.tracks.orderBy('order').last();
  let order = (last?.order ?? -1) + 1;
  const tracks: Track[] = items.map((t) => ({ id: newId('track'), order: order++, ...t }));
  await db.tracks.bulkAdd(tracks);
  return tracks;
}

export function deleteTrack(id: string) {
  return db.tracks.delete(id);
}
