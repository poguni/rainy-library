import { BottomSheet } from '../../components/BottomSheet';
import type { Book } from '../../db/types';

interface Props {
  books: Book[];
  currentId?: string;
  onPick: (id: string) => void;
  onClose: () => void;
}

/** 읽는 중인 책 가운데 하나를 고릅니다. */
export function BookPickerSheet({ books, currentId, onPick, onClose }: Props) {
  return (
    <BottomSheet title="읽을 책 고르기" onClose={onClose}>
      <ul className="mt-3 flex flex-col">
        {books.map((b) => (
          <li key={b.id}>
            <button
              type="button"
              aria-pressed={b.id === currentId}
              onClick={() => {
                onPick(b.id);
                onClose();
              }}
              className="flex min-h-14 w-full items-center justify-between gap-3 border-b border-line text-left"
            >
              <span className="flex flex-col">
                <span className="font-display text-md font-bold">{b.title}</span>
                <span className="text-sm text-ink-muted">
                  {b.author ? `${b.author} · ` : ''}
                  {b.currentPage} / {b.totalPages}쪽
                </span>
              </span>
              {b.id === currentId && (
                <span className="text-sm text-accent-strong">지금 고른 책</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
}
