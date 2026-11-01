import type { BookStatus } from '../../db/types';
import { STATUSES, STATUS_LABEL } from './useLibrary';

interface Props {
  value: BookStatus;
  counts: Record<BookStatus, number>;
  onChange: (s: BookStatus) => void;
}

export function FilterChips({ value, counts, onChange }: Props) {
  return (
    <div role="group" aria-label="책 상태로 거르기" className="flex gap-2">
      {STATUSES.map((s) => {
        const on = s === value;
        return (
          <button
            key={s}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(s)}
            className="press flex min-h-11 items-center"
          >
            {/* 보이는 칩은 36px, 누르는 영역은 44px */}
            <span
              className={`flex h-9 items-center rounded-full px-3.5 text-sm ${
                on ? 'bg-ink text-surface' : 'border border-line-strong text-ink'
              }`}
            >
              {STATUS_LABEL[s]} {counts[s]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
