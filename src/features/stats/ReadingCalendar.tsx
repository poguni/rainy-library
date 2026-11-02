import { ChevronButton } from '../../components/ChevronButton';
import type { CalendarCell } from '../../lib/stats';
import { formatDuration } from '../../lib/time';

const WEEK = ['월', '화', '수', '목', '금', '토', '일'];

// 잔디 진하기 0~4(토큰만 사용)
const LEVEL = [
  'bg-track text-ink-muted',
  'bg-accent-tint text-ink',
  'bg-accent/55 text-ink',
  'bg-accent/80 text-on-accent',
  'bg-accent text-on-accent',
];

interface Props {
  year: number;
  month: number;
  cells: (CalendarCell | null)[];
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

/** 독서 달력(잔디): 날마다 읽은 시간만큼 진하게 */
export function ReadingCalendar({ year, month, cells, canNext, onPrev, onNext }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-md font-bold">독서 달력</h2>
        <div className="flex items-center">
          <ChevronButton dir="prev" label="이전 달" onClick={onPrev} />
          <span className="min-w-24 text-center text-sm tabular-nums" aria-live="polite">
            {year}년 {month + 1}월
          </span>
          <ChevronButton dir="next" label="다음 달" onClick={onNext} disabled={!canNext} />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5" aria-hidden="true">
        {WEEK.map((d) => (
          <div key={d} className="text-center text-xs text-ink-muted">
            {d}
          </div>
        ))}
      </div>
      <ol className="grid grid-cols-7 gap-1.5" aria-label={`${year}년 ${month + 1}월 독서 달력`}>
        {cells.map((c, i) =>
          c ? (
            <li
              key={c.key}
              className={`flex aspect-square items-center justify-center rounded-[var(--radius-sm)] text-xs tabular-nums ${
                c.future ? 'border border-dashed border-line text-ink-muted' : LEVEL[c.level]
              } ${c.today ? 'ring-2 ring-ink' : ''}`}
            >
              <span aria-hidden="true">{c.day}</span>
              <span className="sr-only">
                {month + 1}월 {c.day}일{c.today ? '(오늘)' : ''}{' '}
                {c.minutes > 0 ? formatDuration(c.minutes * 60) : '안 읽음'}
              </span>
            </li>
          ) : (
            <li key={`blank-${i}`} aria-hidden="true" />
          ),
        )}
      </ol>
      <div
        className="flex items-center justify-end gap-1 text-xs text-ink-muted"
        aria-hidden="true"
      >
        적게
        {LEVEL.map((cls, i) => (
          <span key={i} className={`size-3 rounded-[3px] ${cls}`} />
        ))}
        많이
      </div>
    </div>
  );
}
