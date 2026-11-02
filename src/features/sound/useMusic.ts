import { useSyncExternalStore } from 'react';
import { musicPlayer } from './music';

/** 내 음악 플레이어 상태(화면용). 실제 재생은 musicPlayer가 맡습니다. */
export function useMusic() {
  const snap = useSyncExternalStore(musicPlayer.subscribe, musicPlayer.getSnapshot);
  return {
    ...snap,
    current: snap.tracks.find((t) => t.id === snap.currentId) ?? null,
    play: (id?: string) => musicPlayer.play(id),
    toggle: () => musicPlayer.toggle(),
    next: () => musicPlayer.next(),
    prev: () => musicPlayer.prev(),
    setVolume: (v: number) => musicPlayer.setVolume(v),
    toggleShuffle: () => musicPlayer.toggleShuffle(),
    cycleRepeat: () => musicPlayer.cycleRepeat(),
    remove: (id: string) => musicPlayer.remove(id),
  };
}
