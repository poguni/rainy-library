import type { Phase, TimerMode } from '../../../lib/timer';
import { formatClock } from '../../../lib/time';

export interface TimerFaceProps {
  mode: TimerMode;
  phase: Phase;
  /** 뽀모도로: 남은 초 / 자유: 흐른 초 */
  displaySec: number;
  /** 현재 구간 전체 초(자유 모드는 0) */
  totalSec: number;
  /** 4회 주기 안의 회차(1~4) */
  round: number;
  rounds: number;
  paused: boolean;
  /** 지금 읽는 책의 '책 속 한 문장'(종이: 링 아래, 에메랄드: 다이얼 아래) */
  quote?: string;
}

const R = 96;
const C = 2 * Math.PI * R;

/** 종이 서재 타이머(DESIGN.md 8.1): 겹친 종이 2장 + 책장 카드 + 책갈피 리본 + 진행 링 */
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
  const label = free
    ? '자유 독서'
    : `${resting ? '쉬는 시간' : '집중 시간'} · ${round} / ${rounds}회차`;
  const sub = free ? '읽은 시간' : `남은 시간 / ${Math.round(totalSec / 60)}분`;

  return (
    <div className="relative mt-1.5 mr-2 mb-2">
      <div
        aria-hidden="true"
        className="absolute top-2 -right-2 -bottom-2 left-2 rounded-[var(--radius-page)] bg-track"
      />
      <div
        aria-hidden="true"
        className="absolute top-1 -right-1 -bottom-1 left-1 rounded-[var(--radius-page)] border border-line bg-bg"
      />
      <div className="relative flex flex-col items-center gap-3.5 rounded-[var(--radius-page)] border border-line bg-surface-raised px-5 pt-[22px] pb-5">
        <div
          aria-hidden="true"
          className="absolute -top-1.5 right-[34px] h-[78px] w-[22px] bg-ribbon [clip-path:polygon(0_0,100%_0,100%_100%,50%_82%,0_100%)]"
        />
        <div className="self-start text-sm tracking-[0.5px] text-ink-muted">
          {label}
          {paused && ' · 잠시 멈춤'}
        </div>
        <div className="relative size-[208px]">
          <svg width="208" height="208" viewBox="0 0 208 208" aria-hidden="true">
            <circle
              cx="104"
              cy="104"
              r={R}
              fill="none"
              stroke="var(--color-track)"
              strokeWidth="7"
            />
            {progress > 0 && (
              <circle
                cx="104"
                cy="104"
                r={R}
                fill="none"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={`${progress * C} ${C}`}
                transform="rotate(-90 104 104)"
                style={{
                  stroke: resting ? 'var(--color-ink-muted)' : 'var(--color-accent)',
                  transition: 'stroke var(--dur-slow) var(--ease-out)',
                }}
              />
            )}
            <circle
              cx="104"
              cy="104"
              r="80"
              fill="none"
              stroke="var(--color-track)"
              strokeWidth="1"
              strokeDasharray="2 6"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <div
              role="timer"
              aria-label={`${sub} ${formatClock(displaySec)}`}
              className="font-numeral text-[length:var(--text-timer)] leading-none font-bold tracking-[1px] text-ink-strong tabular-nums"
            >
              {formatClock(displaySec)}
            </div>
            <div className="text-sm text-ink-muted">{sub}</div>
          </div>
        </div>
        {quote && (
          <p className="line-clamp-2 max-w-[280px] text-center font-display text-md leading-relaxed text-ink-muted">
            “{quote}”
          </p>
        )}
      </div>
    </div>
  );
}
