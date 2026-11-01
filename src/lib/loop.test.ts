import { crossfadeLoop } from './loop';

const ramp = (n: number) => Float32Array.from({ length: n }, (_, i) => i);

describe('crossfadeLoop', () => {
  it('길이가 fade만큼 줄고, 가운데는 원본 그대로', () => {
    const out = crossfadeLoop(ramp(100), 10);
    expect(out.length).toBe(90);
    expect(Array.from(out.subarray(10))).toEqual(Array.from(ramp(100).subarray(10, 90)));
  });

  it('반복 이음새(마지막 → 처음)가 원본의 이웃한 두 샘플처럼 이어진다', () => {
    const input = ramp(1000);
    const out = crossfadeLoop(input, 100);
    // 마지막 샘플은 원본 899, 첫 샘플은 거의 원본 900(끝부분)에서 시작
    expect(out[out.length - 1]).toBe(899);
    expect(out[0]).toBeCloseTo(900, -1);
    expect(Math.abs(out[0] - out[out.length - 1])).toBeLessThan(15);
  });

  it('겹치는 구간은 앞은 꼬리 쪽, 뒤로 갈수록 머리 쪽 소리', () => {
    const input = new Float32Array(200);
    input.fill(1, 0, 50); // 머리 = 1
    input.fill(0, 150); // 꼬리 = 0
    const out = crossfadeLoop(input, 50);
    expect(out[0]).toBeLessThan(0.1);
    expect(out[49]).toBeGreaterThan(0.99);
  });

  it('fade가 0이면 그대로, 너무 크면 절반까지만', () => {
    expect(crossfadeLoop(ramp(10), 0).length).toBe(10);
    expect(crossfadeLoop(ramp(10), 99).length).toBe(5);
  });
});
