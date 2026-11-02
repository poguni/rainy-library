import { useState } from 'react';
import { AddBookSheet } from './AddBookSheet';
import { BookDetailCard } from './BookDetailCard';
import { FilterChips } from './FilterChips';
import { Shelf } from './Shelf';
import { useLibrary } from './useLibrary';
import { useBookReading } from './useBookReading';
import type { BookStatus } from '../../db/types';

const EMPTY_TEXT: Record<BookStatus, string> = {
  reading: '읽는 중인 책이 없어요. 책을 추가해 보세요.',
  finished: '아직 다 읽은 책이 없어요.',
  paused: '잠시 쉬고 있는 책이 없어요.',
};

export function LibraryPage() {
  const lib = useLibrary();
  const reading = useBookReading(lib.selected);
  const [adding, setAdding] = useState(false);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <div
            aria-hidden="true"
            className="hidden font-numeral text-[16px] text-accent italic emerald:block"
          >
            The Collection
          </div>
          <h1 className="font-display text-xl font-bold emerald:text-[22px]">내 서재</h1>
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="press flex min-h-11 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3.5 text-md"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          책 추가
        </button>
      </div>

      <FilterChips value={lib.status} counts={lib.counts} onChange={lib.setFilter} />

      {!lib.loading && lib.shelf.length === 0 ? (
        <p className="rounded-[var(--radius-lg)] border border-dashed border-line-strong px-4 py-10 text-center text-md text-ink-muted">
          {EMPTY_TEXT[lib.status]}
        </p>
      ) : (
        <Shelf books={lib.shelf} selectedId={lib.selected?.id} onSelect={lib.select} />
      )}

      {lib.selected && (
        <BookDetailCard
          book={lib.selected}
          totals={lib.totals}
          speedText={reading.speedText}
          finish={reading.finish}
          onStatusChange={(s) => lib.changeStatus(lib.selected!.id, s)}
        />
      )}

      {adding && <AddBookSheet onSubmit={lib.add} onClose={() => setAdding(false)} />}
    </section>
  );
}
