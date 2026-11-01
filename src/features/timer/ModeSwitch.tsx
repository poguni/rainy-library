import type { TimerMode } from '../../lib/timer';

const OPTIONS: { value: TimerMode; label: string }[] = [
  { value: 'pomodoro', label: '뽀모도로' },
  { value: 'free', label: '자유 독서' },
];

/** 시작 전 모드 고르기(T-01, T-02) */
export function ModeSwitch({
  value,
  onChange,
}: {
  value: TimerMode;
  onChange: (m: TimerMode) => void;
}) {
  return (
    <div
      role="group"
      aria-label="타이머 방식"
      className="grid grid-cols-2 gap-1 rounded-full border border-line bg-surface p-1"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={`min-h-11 rounded-full text-md ${
            o.value === value ? 'bg-ink text-surface' : 'text-ink-muted'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
