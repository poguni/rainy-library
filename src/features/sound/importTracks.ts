import { addTracks } from '../../db/tracks';
import { isAudioFile, trackName } from '../../lib/playlist';

/** 곡 길이(초). 읽지 못하면 0(재생에는 문제 없음). */
function readDuration(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio();
    const done = (sec: number) => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(sec) ? sec : 0);
    };
    const timer = setTimeout(() => done(0), 5000);
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => done(audio.duration);
    audio.onerror = () => done(0);
    audio.src = url;
  });
}

/** 고른 파일 중 음악 파일만 재생 목록 끝에 저장합니다. 결과 안내 문구를 돌려줍니다. */
export async function importTracks(files: File[]): Promise<string> {
  const audio = files.filter(isAudioFile);
  const skipped = files.length - audio.length;
  if (audio.length === 0) return '음악 파일이 아니라서 불러오지 않았어요.';

  const items = await Promise.all(
    audio.map(async (f) => ({ name: trackName(f.name), fileBlob: f, duration: await readDuration(f) })),
  );
  await addTracks(items);
  // 브라우저가 저장 공간이 부족할 때 마음대로 지우지 않도록 요청(PRD 13장)
  void navigator.storage?.persist?.().catch(() => false);

  return skipped > 0
    ? `${audio.length}곡을 담았어요. 음악이 아닌 파일 ${skipped}개는 뺐어요.`
    : `${audio.length}곡을 담았어요.`;
}
