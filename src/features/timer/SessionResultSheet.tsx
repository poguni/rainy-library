import { BottomSheet } from '../../components/BottomSheet';
import type { Book, Session } from '../../db/types';
import { sessionSummary } from '../../lib/reading';
import { FinishCard } from '../../theme/parts';
import { useBookReading } from '../library/useBookReading';

interface Props {
  session: Session;
  book?: Book;
  /** 이번 세션으로 마지막 쪽에 닿아 완독으로 바뀌었는지(B-05) */
  finished?: boolean;
  onClose: () => void;
}

/** 세션 결과 요약: "22쪽 / 50분 → 0.44쪽/분" + 완독 예상일. 완독했으면 축하 화면 */
export function SessionResultSheet({ session, book, finished, onClose }: Props) {
  const { line, hint } = sessionSummary(session);
  const { finish, speedText } = useBookReading(book);

  return (
    <BottomSheet
      title={finished ? '마지막 장을 덮었어요' : '오늘도 한 장 넘겼어요'}
      onClose={onClose}
    >
      <div className="mt-4 flex flex-col gap-4">
        {finished && (
          <div className="relative flex flex-col gap-1 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface px-4 pt-4 pb-4">
            <svg
              width="22"
              height="64"
              viewBox="0 0 22 64"
              aria-hidden="true"
              className="ribbon-drop absolute top-0 right-5"
            >
              <path d="M0 0h22v64l-11-9-11 9z" fill="var(--color-ribbon)" />
            </svg>
            <p className="pr-10 font-display text-lg font-bold">완독을 축하해요</p>
            <p className="pr-10 text-sm text-ink-muted">
              {book ? `『${book.title}』, 끝까지 읽었어요. ` : ''}서재의 ‘완독’ 칸으로 옮겨
              두었어요.
            </p>
            {speedText !== '—' && (
              <p className="text-sm text-ink-muted">이 책의 평균 속도 · {speedText}</p>
            )}
          </div>
        )}
        <div className="flex flex-col gap-1 rounded-[var(--radius-lg)] bg-surface-sunken px-4 py-3.5">
          {book && <div className="text-sm text-ink-muted">{book.title}</div>}
          <div className="font-numeral text-xl font-bold text-ink-strong">{line}</div>
          {hint && <div className="text-sm text-ink-muted">{hint}</div>}
        </div>
        {!finished && finish && <FinishCard {...finish} />}
        <button
          type="button"
          onClick={onClose}
          className="press mt-1 min-h-12 rounded-full bg-accent text-md text-on-accent shadow-[var(--shadow-primary)]"
        >
          닫기
        </button>
      </div>
    </BottomSheet>
  );
}
