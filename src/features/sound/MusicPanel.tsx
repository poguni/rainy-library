import { useRef, useState } from 'react';
import { VolumeSlider } from '../../components/VolumeSlider';
import { importTracks } from './importTracks';
import { PlayerIcon, type PlayerIconName } from './PlayerIcon';
import { TrackList } from './TrackList';
import { useMusic } from './useMusic';

const REPEAT_LABEL = { off: '반복 안 함', all: '전체 반복', one: '한 곡 반복' } as const;

function IconButton(props: {
  icon: PlayerIconName;
  label: string;
  onClick: () => void;
  pressed?: boolean;
  big?: boolean;
  badge?: string;
}) {
  const { icon, label, onClick, pressed, big, badge } = props;
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={`press relative flex items-center justify-center rounded-full ${
        big
          ? 'size-14 bg-accent text-on-accent shadow-[var(--shadow-primary)]'
          : `size-11 ${pressed === false ? 'text-ink-muted' : 'text-ink'}`
      }`}
    >
      <PlayerIcon name={icon} size={big ? 24 : 22} />
      {badge && <span className="absolute right-1.5 bottom-1 text-xs font-bold">{badge}</span>}
    </button>
  );
}

/** 내 음악 재생 목록(L-01~L-04). 환경음과 함께 섞여 나오고 음량은 따로 조절합니다. */
export function MusicPanel() {
  const music = useMusic();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const volume = Math.round(music.volume * 100);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setMessage('음악을 담는 중이에요…');
    try {
      setMessage(await importTracks([...files]));
    } catch {
      setMessage('음악을 담지 못했어요. 저장 공간을 확인해 주세요.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-md font-bold">내 음악</h2>
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="flex min-h-11 items-center gap-1 text-sm text-accent disabled:opacity-50"
        >
          <PlayerIcon name="plus" size={18} />
          음악 불러오기
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          multiple
          hidden
          aria-label="음악 파일 고르기"
          onChange={(e) => void onFiles(e.target.files)}
        />
      </div>
      <p role="status" className="-mt-2 text-sm text-ink-muted empty:hidden">
        {music.error ?? message}
      </p>

      {music.tracks.length === 0 ? (
        <p className="rounded-[var(--radius-lg)] border border-dashed border-line-strong px-4 py-5 text-sm text-ink-muted">
          기기에 있는 음악 파일(mp3, m4a, ogg, wav)을 불러오면 환경음과 함께 들을 수 있어요. 파일은
          이 기기 안에만 저장돼요.
        </p>
      ) : (
        <div className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-line bg-surface px-4 pt-3 pb-1">
          <p className="truncate text-sm text-ink-muted">
            {music.current ? `지금 곡 · ${music.current.name}` : '곡을 골라 재생해 보세요.'}
          </p>
          <div className="flex items-center justify-between">
            <IconButton
              icon="shuffle"
              label="순서 섞기"
              pressed={music.shuffle}
              onClick={music.toggleShuffle}
            />
            <IconButton icon="prev" label="이전 곡" onClick={music.prev} />
            <IconButton
              icon={music.playing ? 'pause' : 'play'}
              label={music.playing ? '음악 일시정지' : '음악 재생'}
              onClick={music.toggle}
              big
            />
            <IconButton icon="next" label="다음 곡" onClick={music.next} />
            <IconButton
              icon="repeat"
              label={`반복: ${REPEAT_LABEL[music.repeat]}`}
              pressed={music.repeat !== 'off'}
              badge={music.repeat === 'one' ? '1' : undefined}
              onClick={music.cycleRepeat}
            />
          </div>
          <div className="flex items-center gap-3">
            <VolumeSlider
              value={volume}
              label="음악 음량"
              onChange={(v) => music.setVolume(v / 100)}
              className="grow"
            />
            <span className="w-10 text-right text-sm text-ink-muted tabular-nums">{volume}%</span>
          </div>
          <TrackList
            tracks={music.tracks}
            currentId={music.currentId}
            onPlay={music.play}
            onDelete={(id) => void music.remove(id)}
          />
        </div>
      )}
    </div>
  );
}
