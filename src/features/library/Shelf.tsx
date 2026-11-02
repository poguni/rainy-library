import type { Book } from '../../db/types';
import { spineLook } from '../../lib/books';
import { BookSpine } from '../../theme/parts';

interface Props {
  books: Book[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

/** 책꽂이: 책등 줄 + 선반(종이: 나무 판, 에메랄드: 금선). 6권 이상이면 마지막 책을 기대어 놓습니다(종이만). */
export function Shelf({ books, selectedId, onSelect }: Props) {
  return (
    <div className="flex flex-col">
      <ul
        aria-label="책꽂이"
        className="flex h-[142px] items-end gap-1 overflow-x-auto px-2.5 pt-3 pr-6 emerald:justify-center-safe emerald:gap-[3px] emerald:pr-2.5"
      >
        {books.map((book, i) => (
          <li key={book.id} className="flex">
            <BookSpine
              title={book.title}
              look={spineLook(book.id, book.totalPages)}
              selected={book.id === selectedId}
              leaning={books.length >= 6 && i === books.length - 1}
              onSelect={() => onSelect(book.id)}
            />
          </li>
        ))}
      </ul>
      <div
        aria-hidden="true"
        className="h-2.5 rounded-[2px] bg-[var(--color-shelf)] shadow-[0_4px_0_var(--color-shelf-shadow)] emerald:h-0.5 emerald:rounded-none emerald:opacity-80 emerald:shadow-[0_6px_0_var(--color-shelf-shadow)]"
      />
    </div>
  );
}
