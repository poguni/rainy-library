import type { ReactNode } from 'react';

interface Props {
  state: 'idle' | 'running' | 'paused';
  /** 쉬어가기 버튼 이름: 집중 중이면 "쉬어가기", 휴식 중이면 "다시 읽기". 자유 모드는 없음 */
  skipLabel: string | null;
  disabled?: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  onSkip: () => void;
}

const icon = (d: ReactNode, width = 1.6) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {d}
  </svg>
);

function Secondary(props: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={props.onClick}
        className="press flex size-[52px] items-center justify-center rounded-full border border-line-strong bg-surface text-ink emerald:bg-transparent emerald:text-accent-strong"
      >
        {props.children}
        <span className="sr-only">{props.label}</span>
      </button>
      <div aria-hidden="true" className="text-xs text-ink-muted emerald:hidden">
        {props.label}
      </div>
    </div>
  );
}

/** 끝내기 · 시작/일시정지 · 쉬어가기 (시안 타이머 홈 버튼 줄). 주 버튼은 화면에 하나뿐 */
export function TimerControls(p: Props) {
  const primary =
    p.state === 'idle'
      ? { label: '시작하기', onClick: p.onStart, d: <path d="M8 5l11 7-11 7z" />, w: 1.8 }
      : p.state === 'running'
        ? { label: '일시정지', onClick: p.onPause, d: <path d="M9 6v12M15 6v12" />, w: 2.4 }
        : { label: '다시 시작', onClick: p.onResume, d: <path d="M8 5l11 7-11 7z" />, w: 1.8 };

  return (
    <div className="flex items-start justify-center gap-[34px] emerald:items-center emerald:gap-[30px]">
      {p.state !== 'idle' && (
        <Secondary label="끝내기" onClick={p.onEnd}>
          {icon(<rect x="7" y="7" width="10" height="10" rx="1.5" />, 1.8)}
        </Secondary>
      )}
      <div className="flex flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={primary.onClick}
          disabled={p.disabled}
          className="press flex size-[72px] items-center justify-center rounded-full bg-accent text-on-accent shadow-[var(--shadow-primary)] disabled:opacity-50 emerald:size-[76px]"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={primary.w}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {primary.d}
          </svg>
          <span className="sr-only">{primary.label}</span>
        </button>
        <div aria-hidden="true" className="text-xs text-ink emerald:hidden">
          {primary.label}
        </div>
      </div>
      {p.state !== 'idle' && p.skipLabel && (
        <Secondary label={p.skipLabel} onClick={p.onSkip}>
          {icon(<path d="M6 6l8 6-8 6zM18 6v12" />)}
        </Secondary>
      )}
    </div>
  );
}
