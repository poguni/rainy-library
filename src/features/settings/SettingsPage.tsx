import { Link } from 'react-router-dom';
import { getSettings } from '../../db/settings';
import { useLiveQuery } from '../../db/useLiveQuery';
import { ChimeSettings } from './ChimeSettings';
import { DevTools } from './DevTools';
import { ScreenSettings } from './ScreenSettings';
import { TimerSettings } from './TimerSettings';

export function SettingsPage() {
  const settings = useLiveQuery(getSettings, []);
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link
          to="/stats"
          aria-label="기록으로 돌아가기"
          className="-ml-3 flex size-11 items-center justify-center text-ink"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </Link>
        <h1 className="font-display text-xl font-bold">설정</h1>
      </div>
      {settings && (
        <>
          <TimerSettings settings={settings} />
          <hr className="border-line" />
          <ChimeSettings settings={settings} />
          <hr className="border-line" />
          <ScreenSettings settings={settings} />
        </>
      )}
      {/* 개발 모드에서만 보이는 도구(설정 화면 맨 아래) */}
      {import.meta.env.DEV && <DevTools />}
    </section>
  );
}
