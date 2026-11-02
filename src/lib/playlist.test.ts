import { isAudioFile, nextId, nextRepeat, prevId, shuffleIds, trackName } from './playlist';

const q = ['a', 'b', 'c'];

describe('nextId', () => {
  it('다음 곡으로 넘어간다', () => {
    expect(nextId(q, 'a', 'off')).toBe('b');
  });
  it('지금 곡이 없으면 첫 곡', () => {
    expect(nextId(q, null, 'off')).toBe('a');
    expect(nextId(q, 'zz', 'off')).toBe('a');
  });
  it('빈 목록이면 null', () => {
    expect(nextId([], null, 'all')).toBeNull();
  });
  it('곡이 끝났을 때: 마지막 곡이면 반복 안 함은 멈추고, 전체 반복은 처음으로', () => {
    expect(nextId(q, 'c', 'off', true)).toBeNull();
    expect(nextId(q, 'c', 'all', true)).toBe('a');
  });
  it('곡이 끝났을 때 한 곡 반복이면 같은 곡', () => {
    expect(nextId(q, 'b', 'one', true)).toBe('b');
  });
  it('사용자가 다음을 누르면 한 곡 반복이어도 넘어가고, 끝에서는 처음으로', () => {
    expect(nextId(q, 'b', 'one')).toBe('c');
    expect(nextId(q, 'c', 'off')).toBe('a');
  });
});

describe('prevId', () => {
  it('이전 곡, 맨 앞이면 맨 뒤', () => {
    expect(prevId(q, 'b')).toBe('a');
    expect(prevId(q, 'a')).toBe('c');
    expect(prevId([], null)).toBeNull();
  });
});

describe('shuffleIds', () => {
  it('같은 곡들을 담고, first를 맨 앞에 둔다', () => {
    const ids = ['a', 'b', 'c', 'd', 'e'];
    const out = shuffleIds(ids, 'c');
    expect(out[0]).toBe('c');
    expect([...out].sort()).toEqual(ids);
  });
  it('난수에 따라 순서를 바꾼다', () => {
    expect(shuffleIds(['a', 'b', 'c'], undefined, () => 0)).toEqual(['b', 'c', 'a']);
  });
  it('first가 목록에 없으면 무시한다', () => {
    expect(shuffleIds(['a'], 'zz')).toEqual(['a']);
  });
});

describe('nextRepeat', () => {
  it('안 함 → 전체 → 한 곡 → 안 함', () => {
    expect(nextRepeat('off')).toBe('all');
    expect(nextRepeat('all')).toBe('one');
    expect(nextRepeat('one')).toBe('off');
  });
});

describe('trackName / isAudioFile', () => {
  it('확장자를 뺀다', () => {
    expect(trackName('비 오는 날.mp3')).toBe('비 오는 날');
    expect(trackName('a.b.m4a')).toBe('a.b');
    expect(trackName('noext')).toBe('noext');
  });
  it('음악 파일만 고른다', () => {
    expect(isAudioFile({ name: 'x.mp3', type: '' })).toBe(true);
    expect(isAudioFile({ name: 'x', type: 'audio/ogg' })).toBe(true);
    expect(isAudioFile({ name: 'x.jpg', type: 'image/jpeg' })).toBe(false);
  });
});
