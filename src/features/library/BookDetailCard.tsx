import type { Book, BookStatus } from '../../db/types';
import type { BookTotals } from '../../lib/books';
import { progressPercent } from '../../lib/books';
import { formatDuration } from '../../lib/time';
import { STATUSES, STATUS_LABEL } from './useLibrary';
import { BlobImage } from '../../components/BlobImage';

interface Props {
  book: Book;
  totals?: BookTotals;
  onStatusChange: (s: BookStatus) => void;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-[var(--radius-md)] bg-surface-sunken p-2.5">
      <div className="text-xs text-ink-muted">{label}</div>
      <div className="font-numeral text-base font-bold tracking-[-0.5px] whitespace-nowrap">
        {value}
      </div>
    </div>
  );
}

/** 선택한 책의 상세(진행률, 누적 시간, 세션 수). 평균 속도·완독일은 3단계에서 채웁니다. */
export function BookDetailCard({ book, totals, onStatusChange }: Props) {
  const percent = progressPercent(book.currentPage, book.totalPages);

  return (
    <section
      aria-label={`${book.title} 상세`}
      className="mt-1.5 flex flex-col gap-3.5 rounded-[var(--radius-page)] border border-line bg-surface-raised p-[18px]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {book.coverBlob && (
            <BlobImage
              blob={book.coverBlob}
              className="h-[66px] w-[46px] rounded-[2px] object-cover"
            />
          )}
          <div className="flex flex-col gap-0.5">
            <h2 className="font-display text-[22px] font-bold">{book.title}</h2>
            <div className="text-sm text-ink-muted">
              {book.author ? `${book.author} · ` : ''}
              {book.totalPages}쪽
            </div>
          </div>
        </div>
        <span className="shrink-0 rounded-xl bg-accent-soft px-2.5 py-1 text-xs text-accent-strong">
          {STATUS_LABEL[book.status]}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-sm">
          <div>
            {book.currentPage} / {book.totalPages}쪽
          </div>
          <div className="font-bold text-accent-strong">{percent}%</div>
        </div>
        <div
          role="progressbar"
          aria-label="읽은 정도"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2 rounded bg-track"
        >
          <div className="h-2 rounded bg-accent" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="누적 독서" value={totals ? formatDuration(totals.focusSeconds) : '—'} />
        <Stat label="평균 속도" value="—" />
        <Stat label="독서 세션" value={totals ? `${totals.sessionCount}회` : '—'} />
      </div>

      <label className="flex items-center justify-between gap-3 text-sm text-ink-muted">
        상태 바꾸기
        <select
          value={book.status}
          onChange={(e) => onStatusChange(e.target.value as BookStatus)}
          className="min-h-11 rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 text-ink"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
