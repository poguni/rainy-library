import type { Book } from '../../db/types';
import { dayKey } from '../../lib/stats';

/** 인쇄용 '책 속 한 문장': 책별로 묶고, 같은 책은 먼저 남긴 문장부터. 문장이 없으면 그리지 않습니다. */
export function PrintQuotes({ books }: { books: Book[] }) {
  const withQuotes = books.filter((b) => b.quotes?.length);
  if (withQuotes.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-md font-bold">책 속 한 문장</h2>
      {withQuotes.map((b) => (
        <div key={b.id} className="flex flex-col gap-1.5">
          <h3 className="border-b border-line pb-0.5 font-bold break-after-avoid">
            {b.title}
            {b.author && <span className="ml-1.5 font-normal text-ink-muted">{b.author}</span>}
          </h3>
          <ul className="flex flex-col gap-2">
            {[...b.quotes!]
              .sort((x, y) => (x.createdAt < y.createdAt ? -1 : 1))
              .map((q) => (
                <li key={q.id} className="break-inside-avoid border-l-2 border-line pl-3">
                  <blockquote className="font-display leading-relaxed whitespace-pre-line">
                    “{q.text}”
                  </blockquote>
                  <p className="text-xs text-ink-muted tabular-nums">
                    {q.page !== undefined && `${q.page}쪽 · `}
                    {dayKey(new Date(q.createdAt))}
                  </p>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
