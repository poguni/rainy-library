interface Props {
  id: string;
  label: string;
  /** 입력 중인 글자 그대로(빈칸 허용) */
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

/** 쪽수 입력칸(DESIGN.md 7장): 높이 48px, 숫자 키패드, 옆에 −/+ 버튼(44px), label 연결 */
export function PageStepper({ id, label, value, onChange, error }: Props) {
  const step = (delta: number) => onChange(String(Math.max(0, (Number(value) || 0) + delta)));
  const btn =
    'press flex size-11 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface text-xl text-ink';

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-ink-muted">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`${label} 1쪽 줄이기`}
          onClick={() => step(-1)}
          className={btn}
        >
          −
        </button>
        <div className="relative flex-1">
          <input
            id={id}
            inputMode="numeric"
            value={value}
            onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className="h-12 w-full rounded-[var(--radius-md)] border border-line-strong bg-surface pr-9 pl-3 text-center font-numeral text-lg text-ink tabular-nums"
          />
          <span
            aria-hidden="true"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-ink-muted"
          >
            쪽
          </span>
        </div>
        <button
          type="button"
          aria-label={`${label} 1쪽 늘리기`}
          onClick={() => step(1)}
          className={btn}
        >
          +
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-ribbon">
          {error}
        </p>
      )}
    </div>
  );
}
