import { useState } from 'react';
import { Link } from 'react-router-dom';
import { todayLine } from '../../lib/time';

/** 종이 서재 머리말: "빗소리 서재" + 오늘의 한 줄 + 설정 버튼 */
export function TimerHeader() {
  // 화면을 열 때 한 번만 정합니다(쓰는 도중에 문장이 바뀌지 않게).
  const [line] = useState(() => todayLine(new Date()));
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-0.5">
        <h1 className="font-display text-xl font-bold tracking-[-0.3px]">빗소리 서재</h1>
        <div className="text-sm text-ink-muted">{line}</div>
      </div>
      <Link
        to="/stats/settings"
        aria-label="설정"
        className="flex size-11 items-center justify-center rounded-full border border-line-strong bg-surface text-ink"
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
