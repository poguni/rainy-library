// AudioContext는 앱 전체에 하나만 만듭니다(CLAUDE.md). 4단계 믹서도 이것을 씁니다.
let ctx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null;
  ctx ??= new AudioContext();
  return ctx;
}

/** 브라우저 정책상 사용자가 버튼을 누른 뒤에 불러야 소리가 납니다. */
export async function unlockAudio() {
  const c = getAudioContext();
  if (c?.state === 'suspended') await c.resume();
}
