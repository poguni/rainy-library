// 내 음악 플레이어(L-01~L-05). 화면과 상관없이 앱 전체에 하나만 있어 탭을 옮겨도 이어서 재생됩니다.
// <audio> 하나를 MediaElementSource로 믹서에 이어, 환경음과 함께 섞이고 음량은 따로 조절합니다.
import { liveQuery } from 'dexie';
import { getSettings, updateSettings } from '../../db/settings';
import { deleteTrack, listTracks } from '../../db/tracks';
import type { MusicPrefs, Track } from '../../db/types';
import { nextId, nextRepeat, prevId, shuffleIds } from '../../lib/playlist';
import { unlockAudio } from './audioContext';
import { soundEngine } from './engine';
import { bindMediaSession, setNowPlaying } from './mediaSession';

const RAMP_SEC = 0.08;
const RESTART_SEC = 3; // [이전]을 눌렀을 때 이만큼 지났으면 곡 처음으로

export interface TrackView {
  id: string;
  name: string;
  duration: number;
}

export interface MusicSnapshot extends MusicPrefs {
  tracks: TrackView[];
  currentId: string | null;
  playing: boolean;
  error: string | null;
}

class MusicPlayer {
  private snap: MusicSnapshot = {
    tracks: [],
    currentId: null,
    playing: false,
    error: null,
    volume: 0.6,
    shuffle: false,
    repeat: 'all',
  };
  private listeners = new Set<() => void>();
  private blobs = new Map<string, Blob>();
  private queue: string[] = [];
  private el: HTMLAudioElement | null = null;
  private gain: { ctx: AudioContext; node: GainNode } | null = null;
  private url: string | null = null;
  private started = false;
  private saveTimer: ReturnType<typeof setTimeout> | undefined;

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => void this.listeners.delete(fn);
  };
  getSnapshot = () => this.snap;

  private set(patch: Partial<MusicSnapshot>) {
    this.snap = { ...this.snap, ...patch };
    this.listeners.forEach((fn) => fn());
  }

  /** 앱 시작 시 한 번: 재생 목록을 구독하고 저장된 설정을 불러옵니다. */
  init() {
    if (this.started) return;
    this.started = true;
    liveQuery(listTracks).subscribe({
      next: (tracks) => this.onTracks(tracks),
      error: (err) => console.warn('[music] 재생 목록을 불러오지 못했어요', err),
    });
    getSettings()
      .then((s) => s.music && this.set({ ...s.music }))
      .then(() => this.rebuildQueue())
      .catch(() => {});
    bindMediaSession({
      play: () => this.play(),
      pause: () => this.pause(),
      next: () => this.next(),
      prev: () => this.prev(),
    });
  }

  private onTracks(tracks: Track[]) {
    this.blobs = new Map(tracks.map((t) => [t.id, t.fileBlob]));
    this.set({ tracks: tracks.map(({ id, name, duration }) => ({ id, name, duration })) });
    if (this.snap.currentId && !this.blobs.has(this.snap.currentId)) this.unload();
    this.rebuildQueue();
  }

  private rebuildQueue() {
    const ids = this.snap.tracks.map((t) => t.id);
    this.queue = this.snap.shuffle ? shuffleIds(ids, this.snap.currentId ?? undefined) : ids;
  }

  private audio(): HTMLAudioElement {
    if (this.el) return this.el;
    const el = new Audio();
    el.addEventListener('play', () => this.syncPlaying(true));
    el.addEventListener('pause', () => this.syncPlaying(false));
    el.addEventListener('ended', () => this.advance());
    el.addEventListener('error', () => {
      if (el.getAttribute('src')) this.set({ error: '이 곡을 재생하지 못했어요.' });
    });
    const input = soundEngine.musicInput();
    if (input) {
      const node = input.ctx.createGain();
      node.gain.value = this.snap.volume;
      input.ctx.createMediaElementSource(el).connect(node).connect(input.node);
      this.gain = { ctx: input.ctx, node };
    } else {
      el.volume = this.snap.volume; // Web Audio가 없는 브라우저
    }
    this.el = el;
    return el;
  }

  private syncPlaying(playing: boolean) {
    this.set({ playing });
    setNowPlaying(this.currentName(), playing);
  }

  private currentName() {
    return this.snap.tracks.find((t) => t.id === this.snap.currentId)?.name ?? null;
  }

  private load(id: string) {
    const blob = this.blobs.get(id);
    if (!blob) return;
    if (this.url) URL.revokeObjectURL(this.url);
    this.url = URL.createObjectURL(blob);
    this.audio().src = this.url;
    this.set({ currentId: id, error: null });
  }

  private unload() {
    this.el?.pause();
    this.el?.removeAttribute('src');
    if (this.url) URL.revokeObjectURL(this.url);
    this.url = null;
    this.set({ currentId: null, playing: false });
    setNowPlaying(null, false);
  }

  /** 재생(id를 주면 그 곡부터). 사용자가 누른 흐름 안에서 부릅니다. */
  play(id?: string) {
    const target = id ?? this.snap.currentId ?? this.queue[0];
    if (!target) return;
    void unlockAudio();
    if (target !== this.snap.currentId || !this.el?.getAttribute('src')) this.load(target);
    this.audio()
      .play()
      .catch((err: unknown) => {
        if ((err as Error)?.name !== 'AbortError') this.set({ error: '음악을 재생하지 못했어요.' });
      });
  }

  pause() {
    this.el?.pause();
  }

  toggle() {
    if (this.snap.playing) this.pause();
    else this.play();
  }

  next() {
    const id = nextId(this.queue, this.snap.currentId, this.snap.repeat);
    if (id) this.play(id);
  }

  prev() {
    if (this.el && this.el.currentTime > RESTART_SEC) {
      this.el.currentTime = 0;
      return;
    }
    const id = prevId(this.queue, this.snap.currentId);
    if (id) this.play(id);
  }

  /** 곡이 끝났을 때 */
  private advance() {
    const id = nextId(this.queue, this.snap.currentId, this.snap.repeat, true);
    if (id === this.snap.currentId && this.el) {
      this.el.currentTime = 0;
      void this.el.play();
    } else if (id) this.play(id);
  }

  setVolume(volume: number) {
    this.set({ volume });
    if (this.gain) {
      const { ctx, node } = this.gain;
      const t = ctx.currentTime;
      node.gain.cancelScheduledValues(t);
      node.gain.setValueAtTime(node.gain.value, t);
      node.gain.linearRampToValueAtTime(volume, t + RAMP_SEC);
    } else if (this.el) this.el.volume = volume;
    this.savePrefs();
  }

  toggleShuffle() {
    this.set({ shuffle: !this.snap.shuffle });
    this.rebuildQueue();
    this.savePrefs();
  }

  cycleRepeat() {
    this.set({ repeat: nextRepeat(this.snap.repeat) });
    this.savePrefs();
  }

  async remove(id: string) {
    if (id === this.snap.currentId) this.unload();
    await deleteTrack(id);
  }

  private savePrefs() {
    clearTimeout(this.saveTimer);
    const { volume, shuffle, repeat } = this.snap;
    this.saveTimer = setTimeout(() => void updateSettings({ music: { volume, shuffle, repeat } }), 400);
  }
}

export const musicPlayer = new MusicPlayer();

if (import.meta.env.DEV) Object.assign(window, { __musicPlayer: musicPlayer });
