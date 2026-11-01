import { BottomSheet } from '../../components/BottomSheet';
import type { Book, Session } from '../../db/types';
import { sessionSummary } from '../../lib/reading';
import { FinishCard } from '../../theme/parts';
import { useBookReading } from '../library/useBookReading';

interface Props {
  session: Session;
  book?: Book;
  onClose: () => void;
}

/** 세션 결과 요약: "22쪽 / 50분 → 0.44쪽/분" + 완독 예상일 */
export function SessionResultSheet({ session, book, onClose }: Props) {
  const { line, hint } = sessionSummary(session);
  const { finish } = useBookReading(book);

  return (
    <BottomSheet title="오늘도 한 장 넘겼어요" onClose={onClose}>
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1 rounded-[var(--radius-lg)] bg-surface-sunken px-4 py-3.5">
          {book && <div className="text-sm text-ink-muted">{book.title}</div>}
          <div className="font-numeral text-xl font-bold text-ink-strong">{line}</div>
          {hint && <div className="text-sm text-ink-muted">{hint}</div>}
        </div>
        {finish && <FinishCard {...finish} />}
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
