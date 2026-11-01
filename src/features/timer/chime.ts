import { getAudioContext } from '../sound/audioContext';

export type ChimeKind = 'focusEnd' | 'breakEnd';

/** 알림음을 파일 없이 합성합니다(ASSETS.md 2장). 음량은 linearRamp로 부드럽게 올리고 내립니다. */
export function playChime(kind: ChimeKind) {
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') return;
  const t = ctx.currentTime;
  // 집중 끝: 부드러운 종소리(2초) / 휴식 끝: 나무 실로폰 같은 짧은 소리
  const notes =
    kind === 'focusEnd'
      ? [
          { freq: 660, peak: 0.22, len: 2 },
          { freq: 990, peak: 0.1, len: 1.4 },
        ]
      : [
          { freq: 784, peak: 0.25, len: 0.35 },
          { freq: 1568, peak: 0.06, len: 0.2 },
        ];
  for (const n of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = kind === 'focusEnd' ? 'sine' : 'triangle';
    osc.frequency.value = n.freq;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(n.peak, t + 0.02);
    gain.gain.linearRampToValueAtTime(0, t + n.len);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + n.len + 0.05);
  }
}
