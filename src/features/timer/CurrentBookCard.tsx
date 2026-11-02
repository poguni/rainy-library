import { Link } from 'react-router-dom';
import { BlobImage } from '../../components/BlobImage';
import type { Book } from '../../db/types';
import { spineLook } from '../../lib/books';

interface Props {
  book?: Book;
  startPage?: number;
  /** 세션 중에는 책을 바꿀 수 없습니다. */
  canChange: boolean;
  onChange: () => void;
}

/** 지금 읽는 책 카드(시안 타이머 홈): 작은 책등(또는 표지) + 제목 + "저자 · N쪽부터" + 바꾸기 */
export function CurrentBookCard({ book, startPage, canChange, onChange }: Props) {
  if (!book) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-line bg-surface px-3.5 py-3">
        <p className="text-sm text-ink-muted">읽는 중인 책을 먼저 서재에 추가해 주세요.</p>
        <Link
          to="/library"
          className="flex min-h-11 shrink-0 items-center px-3 text-md text-accent"
        >
          서재로 가기
        </Link>
      </div>
    );
  }

  const look = spineLook(book.id, book.totalPages);
  return (
    <div className="flex items-center gap-3.5 rounded-[var(--radius-lg)] border border-line bg-surface px-3.5 py-3 emerald:justify-center emerald:border-0 emerald:bg-transparent emerald:p-0">
      {book.coverBlob ? (
        <BlobImage
          blob={book.coverBlob}
          className="h-[66px] w-[46px] rounded-[2px] object-cover emerald:hidden"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-[66px] w-[46px] shrink-0 items-center justify-center overflow-hidden rounded-[2px_4px_4px_2px] font-display text-xs tracking-[2px] [writing-mode:vertical-rl] emerald:hidden"
          style={{
            background: `var(--spine-${look.colorIndex})`,
            color: look.darkInk ? 'var(--spine-ink-dark)' : 'var(--spine-ink-light)',
            boxShadow: 'inset 4px 0 0 var(--spine-shade)',
          }}
        >
          {book.title}
        </div>
      )}
      <div className="flex min-w-0 grow flex-col gap-[3px] emerald:grow-0 emerald:items-center emerald:gap-0.5">
        <div className="text-xs text-ink-muted emerald:sr-only">지금 읽는 책</div>
        <div className="truncate font-display text-lg font-bold emerald:text-[17px] emerald:before:content-['『'] emerald:after:content-['』']">
          {book.title}
        </div>
        <div className="text-sm text-ink-muted emerald:font-numeral emerald:text-[16px] emerald:text-ink-soft emerald:italic">
          {book.author && (
            <>
              {book.author}
              <span className="emerald:hidden"> · </span>
              <span className="hidden emerald:inline"> — </span>
            </>
          )}
          {startPage ?? book.currentPage}쪽부터
        </div>
      </div>
      {canChange && (
        <button
          type="button"
          onClick={onChange}
          aria-label="읽을 책 바꾸기"
          className="press min-h-11 shrink-0 px-3 text-md text-accent"
        >
          바꾸기
        </button>
      )}
    </div>
  );
}
