export interface FinishCardProps {
  /** 예상 완독일. 계산할 수 없으면 null */
  date: Date | null;
  /** 남은 독서 시간(분) */
  remainingMin: number;
  /** date가 null일 때 보여 줄 문장 */
  note: string;
  /** 화면에 보일 날짜·시간 글자(계산·형식은 훅에서) */
  dateText: string;
  remainingText: string;
}

/** 종이 서재 완독 예상일(DESIGN.md 8.3): 점선 구분선 위에 책갈피 + 한 줄 */
export function FinishCard({ date, note, dateText, remainingText }: FinishCardProps) {
  return (
    <div className="flex items-center gap-3 border-t border-dashed border-line-strong pt-3">
      <svg width="30" height="38" viewBox="0 0 30 38" aria-hidden="true" className="shrink-0">
        <path d="M2 0h26v38l-13-9-13 9z" style={{ fill: 'var(--color-ribbon)' }} />
      </svg>
      <div className="flex flex-col gap-0.5">
        <div className="text-xs text-ink-muted">완독 예상일</div>
        {date ? (
          <>
            <div className="font-display text-xl font-bold">{dateText}</div>
            <div className="text-sm text-ink-muted">
              지금 속도라면 약 <span className="whitespace-nowrap">{remainingText}</span> 더 읽으면
              마지막 장을 덮어요.
            </div>
          </>
        ) : (
          <div className="text-sm text-ink-muted">{note}</div>
        )}
      </div>
    </div>
  );
}
