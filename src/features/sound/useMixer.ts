import { useSyncExternalStore } from 'react';
import { soundEngine } from './engine';
import { SOUND_LABEL } from './sounds';

/** 믹서 상태와 조작(화면용). 실제 소리는 soundEngine이 냅니다. */
export function useMixer() {
  const snap = useSyncExternalStore(soundEngine.subscribe, soundEngine.getSnapshot);
  return {
    ...snap,
    layers: snap.mix.layers.map((l) => ({ ...l, label: SOUND_LABEL[l.soundId] ?? l.soundId })),
    toggle: (id: string) => {
      const l = snap.mix.layers.find((x) => x.soundId === id);
      if (l) soundEngine.setLayer(id, { on: !l.on });
    },
    setVolume: (id: string, volume: number) => soundEngine.setLayer(id, { volume, on: volume > 0 }),
    setMaster: (v: number) => soundEngine.setMaster(v),
    togglePlay: () => (snap.playing ? soundEngine.stop() : void soundEngine.play()),
  };
}

export type MixerLayerView = ReturnType<typeof useMixer>['layers'][number];
