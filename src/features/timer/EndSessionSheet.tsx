import { useState } from 'react';
import { BottomSheet } from '../../components/BottomSheet';
import { PageStepper } from '../../components/PageStepper';
import { checkEndPage } from '../../lib/pages';
import { formatDuration } from '../../lib/time';

interface Props {
  bookTitle: string;
  totalPages: number;
  startPage: number;
  focusSec: number;
  /** endPage가 null이면 쪽수 없이 시간만 기록 */
  onSave: (endPage: number | null) => Promise<void>;
  onClose: () => void;
}

/** 세션 종료 시트(P-02, P-04): 끝 쪽수 입력, 건너뛰기 가능 */
export function EndSessionSheet({
  bookTitle,
  totalPages,
  startPage,
  focusSec,
  onSave,
  onClose,
}: Props) {
  const [value, setValue] = useState(String(startPage));
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);

  const problem = checkEndPage(startPage, value === '' ? NaN : Number(value), totalPages);
  const error = !checked
    ? undefined
    : problem === 'below-start'
      ? `시작 쪽수(${startPage}쪽)보다 작을 수 없어요.`
      : problem === 'over-total'
        ? `이 책은 ${totalPages}쪽까지 있어요.`
        : problem === 'invalid'
          ? '끝 쪽수를 숫자로 적어 주세요.'
          : undefined;

  const save = async (endPage: number | null) => {
    setSaving(true);
    try {
      await onSave(endPage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet title="오늘 독서 마치기" onClose={onClose}>
      <p className="mt-1 text-sm text-ink-muted">
        {bookTitle} · {startPage}쪽부터 · 읽은 시간{' '}
        <span className="whitespace-nowrap">{formatDuration(focusSec)}</span>
      </p>
      <form
        noValidate
        className="mt-5 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setChecked(true);
          if (!problem) void save(Number(value));
        }}
      >
        <PageStepper
          id="end-page"
          label="어디까지 읽었나요?"
          value={value}
          onChange={(v) => {
            setValue(v);
            setChecked(true);
          }}
          error={error}
        />
        <button
          type="submit"
          disabled={saving}
          className="press mt-1 min-h-12 rounded-full bg-accent text-md text-on-accent shadow-[var(--shadow-primary)] disabled:opacity-60"
        >
          기록하기
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void save(null)}
          className="min-h-11 text-md text-accent"
        >
          쪽수 없이 시간만 기록하기
        </button>
        <button type="button" onClick={onClose} className="min-h-11 text-md text-ink-muted">
          계속 읽기
        </button>
      </form>
    </BottomSheet>
  );
}
