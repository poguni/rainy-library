import type { FinishCardProps } from '../paper/FinishCard';

const WEEKDAY = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

/** 에메랄드 서재 완독 예상일(DESIGN.md 8.3): 독립 카드 + 위쪽 가운데 금색 책갈피, THE LAST PAGE */
export function FinishCard({ date, note, remainingText }: FinishCardProps) {
  return (
    <div className="relative flex flex-col items-center gap-1 rounded-[var(--radius-lg)] border border-line bg-surface px-[18px] pt-[18px] pb-4 text-center">
      <svg
        aria-hidden="true"
        className="absolute -top-px left-1/2 -ml-[11px]"
        width="22"
        height="30"
        viewBox="0 0 22 30"
      >
        <path d="M0 0h22v30l-11-7-11 7z" fill="var(--color-ribbon)" />
      </svg>
      <div className="mt-[18px] font-numeral text-xs tracking-[3px] text-accent" aria-hidden="true">
        THE LAST PAGE
      </div>
      <div
        className="font-numeral text-[44px] leading-[1.05] font-semibold text-ink-strong tabular-nums"
        aria-hidden="true"
      >
        {date ? `${date.getMonth() + 1} · ${date.getDate()}` : '— · —'}
      </div>
      {date ? (
        <>
          <div className="font-display text-md">
            {date.getMonth() + 1}월 {date.getDate()}일 {WEEKDAY[date.getDay()]}, 완독 예상
          </div>
          <div className="text-xs text-ink-muted">
            지금 속도라면 약 <span className="whitespace-nowrap">{remainingText}</span> 남았어요
          </div>
        </>
      ) : (
        <div className="text-sm text-ink-muted">{note}</div>
      )}
    </div>
  );
}
