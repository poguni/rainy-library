import { useState } from 'react';
import { Link } from 'react-router-dom';
import { todayLine } from '../../lib/time';

/** 머리말(DESIGN.md 9장). 종이: 왼쪽 "빗소리 서재" + 오늘의 한 줄 / 에메랄드: 가운데 RAINY LIBRARY + 선─마름모─선 */
export function TimerHeader() {
  // 화면을 열 때 한 번만 정합니다(쓰는 도중에 문장이 바뀌지 않게).
  const [line] = useState(() => todayLine(new Date()));
  return (
    <div className="relative flex items-center justify-between emerald:justify-center">
      <div className="flex flex-col gap-0.5 emerald:items-center emerald:gap-1">
        <div
          aria-hidden="true"
          className="hidden font-numeral text-[13px] font-semibold tracking-[5px] text-accent emerald:block"
        >
          RAINY LIBRARY
        </div>
        <h1 className="font-display text-xl font-bold tracking-[-0.3px] emerald:text-[19px] emerald:font-semibold emerald:tracking-[2px]">
          빗소리 서재
        </h1>
        <div className="text-sm text-ink-muted emerald:hidden">{line}</div>
        <div aria-hidden="true" className="mt-1 hidden items-center gap-2 emerald:flex">
          <span className="h-px w-[54px] bg-accent opacity-60" />
          <span className="size-[7px] rotate-45 bg-accent" />
          <span className="h-px w-[54px] bg-accent opacity-60" />
        </div>
      </div>
      <Link
        to="/stats/settings"
        aria-label="설정"
        className="flex size-11 items-center justify-center rounded-full border border-line-strong bg-surface text-ink emerald:absolute emerald:top-0 emerald:right-0 emerald:bg-transparent emerald:text-accent-strong"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
        </svg>
      </Link>
    </div>
  );
}
