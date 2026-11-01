import { useState } from 'react';
import { updateSettings } from '../../db/settings';
import type { Settings } from '../../db/types';

/** 화면 꺼짐 방지(T-06, W-05) */
export function ScreenSettings({ settings }: { settings: Settings }) {
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  const [on, setOn] = useState(settings.wakeLock);
  const toggle = () => {
    setOn(!on);
    void updateSettings({ wakeLock: !on });
  };

  return (
    <section className="flex flex-col gap-1">
      <h2 className="font-display text-md font-bold">화면</h2>
      <div className="flex items-center justify-between gap-3">
        <div id="wake-lock-label" className="text-md">
          읽는 동안 화면 켜 두기
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-labelledby="wake-lock-label"
          onClick={toggle}
          className="flex min-h-11 items-center"
        >
          <span
            aria-hidden="true"
            className={`relative h-7 w-12 rounded-full transition-colors duration-150 ${
              on ? 'bg-accent' : 'bg-line-strong'
            }`}
          >
            <span
              className={`absolute top-1 size-5 rounded-full bg-surface-raised transition-[left] duration-150 ${
                on ? 'left-6' : 'left-1'
              }`}
            />
          </span>
        </button>
      </div>
      <p className="text-sm text-ink-muted">
        {supported
          ? '타이머가 돌아가는 동안 화면이 꺼지지 않아요. 일시정지하면 다시 꺼질 수 있어요.'
          : '이 브라우저는 화면 켜 두기를 지원하지 않아요.'}
      </p>
    </section>
  );
}
