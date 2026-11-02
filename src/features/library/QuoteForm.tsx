import { useState, type FormEvent } from 'react';
import { checkQuote, QUOTE_MAX, type QuoteProblem } from '../../lib/quotes';

interface Props {
  totalPages: number;
  /** 쪽수 칸에 미리 넣을 값(세션 끝 쪽수 등) */
  defaultPage?: number;
  onSave: (text: string, page?: number) => Promise<unknown>;
  onCancel?: () => void;
  /** 같은 화면에 폼이 둘 이상일 때 id가 겹치지 않도록 */
  idPrefix?: string;
  /** 열자마자 문장 칸에 포커스(시트 밖에서 펼칠 때) */
  autoFocus?: boolean;
}

const MESSAGE: Record<QuoteProblem, (total: number) => string> = {
  empty: () => '남기고 싶은 문장을 적어 주세요.',
  'too-long': () => `${QUOTE_MAX}자까지 적을 수 있어요.`,
  'bad-page': (total) => `쪽수는 1~${total} 사이로 적거나 비워 두세요.`,
};

/** 책 속 한 문장 입력: 문장(여러 줄) + 쪽수(선택) */
export function QuoteForm({
  totalPages,
  defaultPage,
  onSave,
  onCancel,
  idPrefix = 'quote',
  autoFocus,
}: Props) {
  const [text, setText] = useState('');
  const [page, setPage] = useState(defaultPage ? String(defaultPage) : '');
  const [problem, setProblem] = useState<QuoteProblem | null>(null);
  const pageNum = page ? Number(page) : undefined;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const p = checkQuote(text, pageNum, totalPages);
    setProblem(p);
    if (p) return;
    await onSave(text, pageNum);
  };

  const errorId = `${idPrefix}-error`;
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <label htmlFor={`${idPrefix}-text`} className="text-sm text-ink-muted">
            문장
          </label>
          <span className="text-xs text-ink-muted tabular-nums">
            {text.length} / {QUOTE_MAX}
          </span>
        </div>
        <textarea
          id={`${idPrefix}-text`}
          value={text}
          rows={4}
          autoFocus={autoFocus}
          maxLength={QUOTE_MAX + 50}
          placeholder="예: 새는 알에서 나오려고 투쟁한다."
          onChange={(e) => setText(e.target.value)}
          aria-invalid={problem === 'empty' || problem === 'too-long'}
          aria-describedby={problem ? errorId : undefined}
          className="w-full resize-none rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 py-2.5 font-display text-md leading-relaxed text-ink"
        />
      </div>
      <div className="flex items-center gap-3">
        <label htmlFor={`${idPrefix}-page`} className="text-sm text-ink-muted">
          쪽수(선택)
        </label>
        <input
          id={`${idPrefix}-page`}
          inputMode="numeric"
          value={page}
          onChange={(e) => setPage(e.target.value.replace(/[^0-9]/g, ''))}
          aria-invalid={problem === 'bad-page'}
          aria-describedby={problem ? errorId : undefined}
          className="h-11 w-24 rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 text-center font-numeral text-md text-ink tabular-nums"
        />
        <span className="text-sm text-ink-muted">/ {totalPages}쪽</span>
      </div>
      {problem && (
        <p id={errorId} role="alert" className="text-sm text-ribbon">
          {MESSAGE[problem](totalPages)}
        </p>
      )}
      <div className={`grid gap-2 ${onCancel ? 'grid-cols-2' : ''}`}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="press min-h-12 rounded-full border border-line-strong text-md text-ink"
          >
            그만두기
          </button>
        )}
        <button
          type="submit"
          className="press min-h-12 rounded-full bg-accent text-md text-on-accent shadow-[var(--shadow-primary)]"
        >
          남기기
        </button>
      </div>
    </form>
  );
}
