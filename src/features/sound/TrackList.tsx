import { formatClock } from '../../lib/time';
import { PlayerIcon } from './PlayerIcon';
import type { TrackView } from './music';

interface Props {
  tracks: TrackView[];
  currentId: string | null;
  onPlay: (id: string) => void;
  onDelete: (id: string) => void;
}

/** 재생 목록: 곡을 누르면 그 곡부터 재생합니다. */
export function TrackList({ tracks, currentId, onPlay, onDelete }: Props) {
  return (
    <ol aria-label="재생 목록" className="flex flex-col">
      {tracks.map((t) => {
        const current = t.id === currentId;
        return (
          <li key={t.id} className="flex items-center border-b border-line last:border-b-0">
            <button
              type="button"
              onClick={() => onPlay(t.id)}
              aria-current={current ? 'true' : undefined}
              className={`flex min-h-12 min-w-0 grow items-center gap-2.5 text-left ${
                current ? 'text-accent' : 'text-ink'
              }`}
            >
              <span className="flex w-5 shrink-0 justify-center text-ink-muted">
                {current && <PlayerIcon name="music" size={16} />}
              </span>
              <span className="truncate text-md">{t.name}</span>
              <span className="ml-auto shrink-0 pl-2 text-sm text-ink-muted tabular-nums">
                {t.duration > 0 ? formatClock(t.duration) : ''}
              </span>
            </button>
            <button
              type="button"
              aria-label={`${t.name} 목록에서 빼기`}
              onClick={() => onDelete(t.id)}
              className="flex size-11 shrink-0 items-center justify-center text-ink-muted"
            >
              <PlayerIcon name="trash" size={18} />
            </button>
          </li>
        );
      })}
    </ol>
  );
}
