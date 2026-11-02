import { useState } from 'react';
import { BottomSheet } from '../../components/BottomSheet';
import { addQuote, removeQuote } from '../../db/books';
import type { Book } from '../../db/types';
import { PlayerIcon } from '../sound/PlayerIcon';
import { QuoteForm } from './QuoteForm';

/** 책 상세의 '책 속 한 문장': 목록 + 남기기 + 지우기(한 번 더 확인) */
export function BookQuotes({ book }: { book: Book }) {
  const [adding, setAdding] = useState(false);
  const [confirmId, setConfirmId] = useState<string>();
  const quotes = book.quotes ?? [];

  return (
    <div className="flex flex-col gap-2 border-t border-dashed border-line-strong pt-3.5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-md font-bold">책 속 한 문장</h3>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex min-h-11 items-center text-sm text-accent"
        >
          + 문장 남기기
        </button>
      </div>

      {quotes.length === 0 ? (
        <p className="text-sm text-ink-muted">
          마음에 남은 문장을 적어 두면 타이머에서 다시 만나요.
        </p>
      ) : (
        <ul className="flex flex-col">
          {[...quotes].reverse().map((q) => (
            <li
              key={q.id}
              className="flex items-start gap-2 border-b border-line py-2 last:border-b-0"
            >
              <blockquote className="grow py-1.5 font-display text-md leading-relaxed whitespace-pre-line">
                “{q.text}”
                {q.page !== undefined && (
                  <span className="ml-1.5 font-body text-xs text-ink-muted">{q.page}쪽</span>
                )}
              </blockquote>
              {confirmId === q.id ? (
                <div className="flex shrink-0 items-center">
                  <button
                    type="button"
                    onClick={() => setConfirmId(undefined)}
                    className="min-h-11 px-2 text-sm text-ink-muted"
                  >
                    그만두기
                  </button>
                  <button
                    type="button"
                    onClick={() => void removeQuote(book.id, q.id)}
                    className="min-h-11 px-2 text-sm text-ribbon"
                  >
                    지우기
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  aria-label="이 문장 지우기"
                  onClick={() => setConfirmId(q.id)}
                  className="flex size-11 shrink-0 items-center justify-center text-ink-muted"
                >
                  <PlayerIcon name="trash" size={18} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {adding && (
        <BottomSheet title="책 속 한 문장" onClose={() => setAdding(false)}>
          <p className="mt-1 mb-4 text-sm text-ink-muted">{book.title}</p>
          <QuoteForm
            totalPages={book.totalPages}
            onSave={(text, page) => addQuote(book.id, text, page).then(() => setAdding(false))}
          />
        </BottomSheet>
      )}
    </div>
  );
}
