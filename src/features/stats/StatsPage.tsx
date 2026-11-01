import { Link } from 'react-router-dom';

export function StatsPage() {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold">기록</h1>
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
      <p className="mt-2 text-sm text-ink-muted">아직 준비 중이에요.</p>
    </section>
  );
}
