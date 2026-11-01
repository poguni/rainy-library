import { Link } from 'react-router-dom';
import { DevTools } from './DevTools';

export function SettingsPage() {
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
      <p className="text-sm text-ink-muted">
        타이머·알림음·테마 설정은 다음 단계에서 이곳에 추가돼요.
      </p>
      {/* 개발 모드에서만 보이는 도구(설정 화면 맨 아래) */}
      {import.meta.env.DEV && <DevTools />}
    </section>
  );
}
