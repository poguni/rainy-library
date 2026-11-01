// 환경음 엔진(PRD 9.1). 화면과 상관없이 앱 전체에 하나만 있습니다.
// [소리별 BufferSource(loop)] → [소리별 Gain] → [마스터 Gain] → [단계 Gain] → [Compressor] → 스피커
//   - 단계 Gain: 재생/정지와 집중·휴식 페이드(T-07)를 맡습니다.
import { getSettings, updateSettings } from '../../db/settings';
import type { Mix, SoundLayer } from '../../db/types';
import { crossfadeLoop } from '../../lib/loop';
import { getAudioContext } from './audioContext';
import { DEFAULT_MIX, normalizeMix, SOUNDS } from './sounds';

const RAMP_SEC = 0.08; // 음량 슬라이더·스위치: 짧게 부드럽게('툭' 방지)
const FADE_IN_SEC = 3; // 재생 시작
const PHASE_FADE_SEC = 3; // 집중 ↔ 휴식
const STOP_FADE_SEC = 1.5; // 정지
const LOOP_FADE_SEC = 1; // 반복 이음새 크로스페이드

export interface MixerSnapshot {
  mix: Mix;
  playing: boolean;
  loading: boolean;
  error: string | null;
}

interface Graph {
  master: GainNode;
  phase: GainNode;
  layers: Map<string, GainNode>;
}

function ramp(ctx: AudioContext, param: AudioParam, value: number, sec: number) {
  const t = ctx.currentTime;
  param.cancelScheduledValues(t);
  param.setValueAtTime(param.value, t);
  param.linearRampToValueAtTime(value, t + sec);
}

function makeLoopBuffer(ctx: AudioContext, raw: AudioBuffer): AudioBuffer {
  const fade = Math.min(raw.sampleRate * LOOP_FADE_SEC, raw.length / 4);
  const channels = Array.from({ length: raw.numberOfChannels }, (_, c) =>
    crossfadeLoop(raw.getChannelData(c), fade),
  );
  const out = ctx.createBuffer(raw.numberOfChannels, channels[0].length, raw.sampleRate);
  channels.forEach((data, c) => out.copyToChannel(data, c));
  return out;
}

class SoundEngine {
  private snap: MixerSnapshot = { mix: DEFAULT_MIX, playing: false, loading: false, error: null };
  private listeners = new Set<() => void>();
  private graph: Graph | null = null;
  /** 소리별 불러오기(한 번만). 켜진 소리만 불러와 휴대폰 메모리를 아낍니다. */
  private loads = new Map<string, Promise<void>>();
  private phaseLevel = 1;
  private saveTimer: ReturnType<typeof setTimeout> | undefined;

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => void this.listeners.delete(fn);
  };
  getSnapshot = () => this.snap;

  private set(patch: Partial<MixerSnapshot>) {
    this.snap = { ...this.snap, ...patch };
    this.listeners.forEach((fn) => fn());
  }

  /** 저장된 믹서 조합을 불러옵니다(앱 시작 시 한 번). */
  async init() {
    try {
      const saved = (await getSettings()).mixer;
      if (saved) {
        this.set({ mix: normalizeMix(saved) });
        this.applyMix();
      }
    } catch (err) {
      // 저장소를 못 열어도 기본 조합으로 소리는 낼 수 있습니다.
      console.warn('[sound] 저장된 믹서를 불러오지 못했어요', err);
    }
  }

  private ensureGraph(): AudioContext | null {
    const ctx = getAudioContext();
    if (!ctx) return null;
    if (!this.graph) {
      const master = ctx.createGain();
      const phase = ctx.createGain();
      const comp = ctx.createDynamicsCompressor();
      master.gain.value = this.snap.mix.masterVolume;
      phase.gain.value = 0;
      master.connect(phase).connect(comp).connect(ctx.destination);
      const layers = new Map<string, GainNode>();
      for (const s of SOUNDS) {
        const g = ctx.createGain();
        g.gain.value = 0;
        g.connect(master);
        layers.set(s.id, g);
      }
      this.graph = { master, phase, layers };
    }
    return ctx;
  }

  /** 소리 하나를 받아 디코딩하고, 반복 이음새를 처리한 뒤 무한 반복으로 틀어 둡니다. */
  private loadSound(ctx: AudioContext, id: string): Promise<void> {
    const cached = this.loads.get(id);
    if (cached) return cached;
    const info = SOUNDS.find((s) => s.id === id);
    if (!info) return Promise.resolve();
    const job = fetch(info.url)
      .then((res) => res.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .then((raw) => {
        const src = ctx.createBufferSource();
        src.buffer = makeLoopBuffer(ctx, raw);
        src.loop = true;
        const gain = this.graph!.layers.get(id)!.gain;
        const layer = this.snap.mix.layers.find((l) => l.soundId === id);
        // 이미 켜진 소리가 뒤늦게 시작돼도 갑자기 튀어나오지 않게 0에서 올립니다.
        const t = ctx.currentTime;
        gain.cancelScheduledValues(t);
        gain.setValueAtTime(0, t);
        gain.linearRampToValueAtTime(layer?.on ? layer.volume : 0, t + 0.5);
        src.connect(this.graph!.layers.get(id)!);
        src.start();
      })
      .catch((err) => {
        console.error('[sound]', id, err);
        this.loads.delete(id);
        this.set({ error: '소리를 불러오지 못했어요.' });
      });
    this.loads.set(id, job);
    return job;
  }

  /** 켜져 있는 소리 중 아직 안 불러온 것을 불러옵니다. */
  private async loadOn(ctx: AudioContext) {
    const ids = this.snap.mix.layers.filter((l) => l.on && !this.loads.has(l.soundId));
    if (ids.length === 0) return;
    this.set({ loading: true, error: null });
    await Promise.all(ids.map((l) => this.loadSound(ctx, l.soundId)));
    this.set({ loading: false });
  }

  private applyMix(sec = RAMP_SEC) {
    const ctx = getAudioContext();
    if (!ctx || !this.graph) return;
    for (const l of this.snap.mix.layers) {
      const g = this.graph.layers.get(l.soundId);
      if (g) ramp(ctx, g.gain, l.on ? l.volume : 0, sec);
    }
    ramp(ctx, this.graph.master.gain, this.snap.mix.masterVolume, sec);
  }

  /** 재생: 서서히 커집니다. 반드시 사용자가 버튼을 누른 흐름 안에서 부릅니다. */
  async play() {
    const ctx = this.ensureGraph();
    this.set({ playing: true });
    if (!ctx) return;
    const resumed = ctx.state === 'suspended' ? ctx.resume() : Promise.resolve();
    this.applyMix(0);
    await resumed;
    await this.loadOn(ctx);
    if (this.snap.playing) ramp(ctx, this.graph!.phase.gain, this.phaseLevel, FADE_IN_SEC);
  }

  /** 정지: 서서히 작아집니다. */
  stop() {
    this.set({ playing: false });
    const ctx = getAudioContext();
    if (ctx && this.graph) ramp(ctx, this.graph.phase.gain, 0, STOP_FADE_SEC);
  }

  /** 집중(1) ↔ 휴식(BREAK_LEVEL) 전환 페이드(T-07) */
  setPhaseLevel(level: number) {
    if (level === this.phaseLevel) return;
    this.phaseLevel = level;
    const ctx = getAudioContext();
    if (ctx && this.graph && this.snap.playing) {
      ramp(ctx, this.graph.phase.gain, level, PHASE_FADE_SEC);
    }
  }

  setLayer(soundId: string, patch: Partial<SoundLayer>) {
    const layers = this.snap.mix.layers.map((l) =>
      l.soundId === soundId ? { ...l, ...patch } : l,
    );
    this.updateMix({ ...this.snap.mix, layers });
  }

  setMaster(masterVolume: number) {
    this.updateMix({ ...this.snap.mix, masterVolume });
  }

  private updateMix(mix: Mix) {
    this.set({ mix });
    this.applyMix();
    const ctx = getAudioContext();
    if (ctx && this.graph && this.snap.playing) void this.loadOn(ctx); // 새로 켠 소리
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => void updateSettings({ mixer: this.snap.mix }), 400);
  }

  /** 개발 확인용: 지금 단계 Gain 값 */
  debugLevel() {
    return this.graph?.phase.gain.value ?? 0;
  }
}

export const soundEngine = new SoundEngine();

if (import.meta.env.DEV) Object.assign(window, { __soundEngine: soundEngine });
