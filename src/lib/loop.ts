/**
 * 끊김 없는 반복용 크로스페이드(PRD 13장 '반복 지점의 툭 소리' 대응).
 * 끝 fade개 샘플을 처음 fade개 샘플에 겹쳐 섞고, 결과 길이는 length - fade 입니다.
 * 그러면 결과의 마지막 샘플 → 첫 샘플이 원본에서 바로 이웃한 두 샘플이 되어 이음새가 사라집니다.
 * 환경음은 서로 상관없는 소음이므로 equal-power(sin/cos) 곡선을 씁니다.
 */
export function crossfadeLoop(input: Float32Array, fade: number): Float32Array<ArrayBuffer> {
  const len = input.length;
  const f = Math.max(0, Math.min(Math.floor(fade), Math.floor(len / 2)));
  if (f === 0) return input.slice();
  const out = new Float32Array(len - f);
  const tailStart = len - f;
  for (let i = 0; i < f; i++) {
    const t = (i + 0.5) / f;
    out[i] =
      input[i] * Math.sin((t * Math.PI) / 2) + input[tailStart + i] * Math.cos((t * Math.PI) / 2);
  }
  out.set(input.subarray(f, tailStart), f);
  return out;
}
