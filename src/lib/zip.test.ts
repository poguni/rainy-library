// @vitest-environment node
import { deflateRawSync } from 'node:zlib';
import { crc32, isZip, makeZip, readZip } from './zip';

const enc = new TextEncoder();
const dec = new TextDecoder();

describe('zip', () => {
  it('crc32: 표준 확인 값', () => {
    expect(crc32(enc.encode('123456789'))).toBe(0xcbf43926);
    expect(crc32(new Uint8Array())).toBe(0);
  });

  it('만든 ZIP을 그대로 다시 읽는다(한글 이름·빈 파일 포함)', async () => {
    const zip = makeZip([
      { name: 'backup.json', data: enc.encode('{"a":1}') },
      { name: 'covers/책_1.jpg', data: new Uint8Array([0xff, 0xd8, 0, 1, 2]) },
      { name: 'empty.txt', data: new Uint8Array() },
    ]);
    expect(isZip(zip)).toBe(true);
    const files = await readZip(zip);
    expect([...files.keys()]).toEqual(['backup.json', 'covers/책_1.jpg', 'empty.txt']);
    expect(dec.decode(files.get('backup.json'))).toBe('{"a":1}');
    expect([...files.get('covers/책_1.jpg')!]).toEqual([0xff, 0xd8, 0, 1, 2]);
    expect(files.get('empty.txt')!.length).toBe(0);
  });

  it('압축(deflate)된 항목도 푼다', async () => {
    const text = '빗소리 서재 '.repeat(200);
    const packed = new Uint8Array(deflateRawSync(enc.encode(text)));
    const zip = makeZip([{ name: 'backup.json', data: packed }]);
    // 압축 방식을 deflate(8)로 바꿔 다른 프로그램이 압축한 ZIP처럼 만듭니다.
    const v = new DataView(zip.buffer);
    v.setUint16(8, 8, true);
    const cd = v.getUint32(zip.length - 22 + 16, true);
    v.setUint16(cd + 10, 8, true);
    const files = await readZip(zip);
    expect(dec.decode(files.get('backup.json'))).toBe(text);
  });

  it('ZIP이 아니면 isZip은 false, readZip은 알기 쉬운 오류', async () => {
    const json = enc.encode('{"schema":"x"}');
    expect(isZip(json)).toBe(false);
    await expect(readZip(json)).rejects.toThrow('ZIP 파일을 읽지 못했어요.');
  });
});
