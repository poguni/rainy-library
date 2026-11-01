import { getAudioContext } from '../sound/audioContext';

/** 어떤 전환인지: 집중이 끝남(→휴식) / 휴식이 끝남(→집중) */
export type ChimeKind = 'focusEnd' | 'breakEnd';
/** 설정의 알림음 종류(W-05) */
export type ChimeStyle = 'bell' | 'wood' | 'none';

export const CHIME_OPTIONS: { value: ChimeStyle; label: string }[] = [
  { value: 'bell', label: '종소리' },
  { value: 'wood', label: '나무 실로폰' },
  { value: 'none', label: '알림음 없음' },
];

export function toChimeStyle(value: string | undefined): ChimeStyle {
  return value === 'wood' || value === 'none' ? value : 'bell';
}

interface Note {
  freq: number;
  peak: number;
  len: number;
  /** 시작 지연(초) */
  at?: number;
  wave: OscillatorType;
}

const BELL: Note[] = [
  { freq: 660, peak: 0.22, len: 2, wave: 'sine' },
  { freq: 990, peak: 0.1, len: 1.4, wave: 'sine' },
];
const WOOD_UP: Note[] = [
  { freq: 784, peak: 0.25, len: 0.35, wave: 'triangle' },
  { freq: 1568, peak: 0.06, len: 0.2, wave: 'triangle' },
];
const WOOD_DOWN: Note[] = [
  { freq: 784, peak: 0.25, len: 0.35, wave: 'triangle' },
  { freq: 587, peak: 0.25, len: 0.5, at: 0.22, wave: 'triangle' },
];

const SETS: Record<Exclude<ChimeStyle, 'none'>, Record<ChimeKind, Note[]>> = {
  bell: { focusEnd: BELL, breakEnd: WOOD_UP },
  wood: { focusEnd: WOOD_DOWN, breakEnd: WOOD_UP },
};

/** 알림음을 파일 없이 합성합니다(ASSETS.md 2장). 음량은 linearRamp로 부드럽게 올리고 내립니다. */
export function playChime(kind: ChimeKind, style: ChimeStyle = 'bell') {
  if (style === 'none') return;
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') return;
  for (const n of SETS[style][kind]) {
    const t = ctx.currentTime + (n.at ?? 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = n.wave;
    osc.frequency.value = n.freq;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(n.peak, t + 0.02);
    gain.gain.linearRampToValueAtTime(0, t + n.len);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + n.len + 0.05);
  }
}
