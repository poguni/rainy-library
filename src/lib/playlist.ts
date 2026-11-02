// 재생 목록 순서 계산(L-02). 곡 목록은 id 배열로 다룹니다.
export type RepeatMode = 'off' | 'all' | 'one';

const REPEAT_ORDER: RepeatMode[] = ['off', 'all', 'one'];

/** 반복 버튼을 누를 때마다: 안 함 → 전체 → 한 곡 → 안 함 */
export function nextRepeat(mode: RepeatMode): RepeatMode {
  return REPEAT_ORDER[(REPEAT_ORDER.indexOf(mode) + 1) % REPEAT_ORDER.length];
}

/** 순서 섞기(피셔-예이츠). first를 주면 그 곡을 맨 앞에 둡니다(지금 곡이 끊기지 않게). */
export function shuffleIds(ids: string[], first?: string, rand: () => number = Math.random) {
  const rest = ids.filter((id) => id !== first);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return first && ids.includes(first) ? [first, ...rest] : rest;
}

/**
 * 다음 곡. 곡이 끝났을 때(auto)는 '한 곡 반복'이면 같은 곡,
 * 끝까지 갔으면 '전체 반복'일 때만 처음으로, 아니면 null(멈춤).
 * 사용자가 [다음]을 누르면 '한 곡 반복'이어도 다음 곡으로 넘어가고, 끝에서는 처음으로 돌아갑니다.
 */
export function nextId(
  queue: string[],
  current: string | null,
  repeat: RepeatMode,
  auto = false,
): string | null {
  if (queue.length === 0) return null;
  const i = current ? queue.indexOf(current) : -1;
  if (i < 0) return queue[0];
  if (auto && repeat === 'one') return current;
  if (i + 1 < queue.length) return queue[i + 1];
  return !auto || repeat !== 'off' ? queue[0] : null;
}

/** 이전 곡: 맨 앞이면 맨 뒤로 */
export function prevId(queue: string[], current: string | null): string | null {
  if (queue.length === 0) return null;
  const i = current ? queue.indexOf(current) : -1;
  if (i < 0) return queue[0];
  return queue[(i - 1 + queue.length) % queue.length];
}

/** 파일 이름에서 확장자를 뺀 곡 이름 */
export function trackName(fileName: string): string {
  const name = fileName.replace(/\.[a-z0-9]+$/i, '').trim();
  return name || fileName;
}

const AUDIO_EXT = /\.(mp3|m4a|aac|ogg|oga|opus|wav|flac|webm)$/i;

/** 음악 파일인지(형식 정보가 비어 있는 기기도 있어 확장자도 봅니다) */
export function isAudioFile(file: { name: string; type: string }): boolean {
  return file.type.startsWith('audio/') || AUDIO_EXT.test(file.name);
}
