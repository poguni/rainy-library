import { formatClock } from '../../../lib/time';
import type { TimerFaceProps } from '../paper/TimerFace';

const R = 104; // 진행 링
const C = 2 * Math.PI * R;
const TICK_R = 120;
const TICK_C = 2 * Math.PI * TICK_R;
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
const roman = (n: number) => ROMAN[n - 1] ?? String(n);

/**
 * 에메랄드 서재 타이머(DESIGN.md 8.1): 카드 없이 금장 다이얼.
 * 바깥 금선 원 → 1분 눈금 60개 → 5분 굵은 눈금 12개 → 진행 링 → 안쪽 원판, 12시 방향 금색 마름모
 * 다이얼 아래에 짧은 금선 + 책 속 한 문장(있을 때)
 */
export function TimerFace({
  mode,
  phase,
  displaySec,
  totalSec,
  round,
  rounds,
  paused,
  quote,
}: TimerFaceProps) {
  const resting = phase !== 'focus';
  const free = mode === 'free';
  const progress = free || totalSec === 0 ? 0 : (totalSec - displaySec) / totalSec;
  const deco = free
    ? 'FREE READING'
    : resting
      ? 'REST'
      : `FOCUS · ${roman(round)} / ${roman(rounds)}`;
  const label = free
    ? '자유 독서'
    : `${resting ? '쉬는 시간' : '집중 시간'} · ${round} / ${rounds}회차`;
  const sub = free ? '읽은 시간' : '남은 시간';

  return (
    <div className="mx-auto flex flex-col items-center gap-3">
      <div className="relative size-[268px]">
        <svg width="268" height="268" viewBox="0 0 268 268" aria-hidden="true">
          <circle
            cx="134"
            cy="134"
            r="130"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="1"
            opacity="0.7"
          />
          <circle
            cx="134"
            cy="134"
            r={TICK_R}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="7"
            strokeDasharray={`1 ${TICK_C / 60 - 1}`}
            opacity="0.45"
          />
          <circle
            cx="134"
            cy="134"
            r={TICK_R}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="13"
            strokeDasharray={`2 ${TICK_C / 12 - 2}`}
            transform="rotate(-90.5 134 134)"
          />
          <circle cx="134" cy="134" r={R} fill="none" stroke="var(--color-track)" strokeWidth="3" />
          {progress > 0 && (
            <circle
              cx="134"
              cy="134"
              r={R}
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${progress * C} ${C}`}
              transform="rotate(-90 134 134)"
              style={{
                stroke: resting ? 'var(--color-accent-strong)' : 'var(--color-accent)',
                transition: 'stroke var(--dur-slow) var(--ease-out)',
              }}
            />
          )}
          <circle
            cx="134"
            cy="134"
            r="90"
            fill="var(--color-surface-sunken)"
            stroke="var(--color-accent)"
            strokeWidth="0.6"
            opacity="0.9"
          />
          <path d="M134 22l5 8-5 8-5-8z" fill="var(--color-accent)" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <div className="font-numeral text-xs tracking-[3px] text-accent" aria-hidden="true">
            {deco}
          </div>
          <span className="sr-only">{label}</span>
          <div
            role="timer"
            aria-label={`${sub} ${formatClock(displaySec)}`}
            className="font-numeral text-[length:var(--text-timer)] leading-none font-semibold tracking-[1px] text-ink-strong tabular-nums"
          >
            {formatClock(displaySec)}
          </div>
          <div className="text-xs text-ink-muted">
            {sub}
            {paused && ' · 잠시 멈춤'}
          </div>
        </div>
      </div>
      {quote && (
        <div className="flex flex-col items-center gap-2.5">
          <span aria-hidden="true" className="h-px w-10 bg-accent opacity-70" />
          <p className="line-clamp-2 max-w-[280px] text-center font-display text-md leading-relaxed text-ink-muted">
            “{quote}”
          </p>
        </div>
      )}
    </div>
  );
}
