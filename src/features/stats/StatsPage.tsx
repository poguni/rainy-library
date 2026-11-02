import { Link } from 'react-router-dom';
import { ChevronButton } from '../../components/ChevronButton';
import { formatDuration } from '../../lib/time';
import { BarChart } from './BarChart';
import { ExportPanel } from './ExportPanel';
import { ReadingCalendar } from './ReadingCalendar';
import { useStats, type BarMode } from './useStats';

const MODES: { value: BarMode; label: string }[] = [
  { value: 'week', label: '주간' },
  { value: 'month', label: '월간' },
];

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-[var(--radius-md)] bg-surface-sunken px-3 py-2.5">
      <span className="text-xs text-ink-muted">{label}</span>
      <span className="font-display text-md font-bold">{value}</span>
    </div>
  );
}

/** 기록 탭(B-06): 요약, 주간·월간 막대그래프, 독서 달력, 내보내기 */
export function StatsPage() {
  const st = useStats();
  const total = st.bars.reduce((sum, b) => sum + b.minutes, 0);
  const barTitle =
    st.mode === 'month'
      ? '최근 6개월'
      : st.weekOffset === 0
        ? '이번 주 독서'
        : st.weekOffset === -1
          ? '지난주 독서'
          : `${-st.weekOffset}주 전 독서`;

  return (
    <section className="flex flex-col gap-6">
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

      {st.empty && (
        <p className="-mt-3 text-sm text-ink-muted">
          아직 기록이 없어요. 타이머로 한 번 읽고 나면 여기에 쌓여요.
        </p>
      )}

      <div className="grid grid-cols-3 gap-2">
        <Summary label="이번 달" value={formatDuration(st.thisMonth.minutes * 60)} />
        <Summary label="읽은 날" value={`${st.thisMonth.days}일`} />
        <Summary label="이어 읽기" value={`${st.streak}일째`} />
      </div>

      <div className="flex flex-col gap-3">
        <div
          role="group"
          aria-label="그래프 기간"
          className="grid grid-cols-2 gap-1 rounded-full border border-line bg-surface p-1"
        >
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              aria-pressed={st.mode === m.value}
              onClick={() => st.setMode(m.value)}
              className={`min-h-11 rounded-full text-md ${
                st.mode === m.value ? 'bg-ink text-surface' : 'text-ink-muted'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-md font-bold">{barTitle}</h2>
          <div className="flex items-center gap-1">
            <span className="text-sm text-ink-muted">{formatDuration(total * 60)}</span>
            {st.mode === 'week' && (
              <>
                <ChevronButton dir="prev" label="이전 주" onClick={st.prevWeek} />
                <ChevronButton
                  dir="next"
                  label="다음 주"
                  onClick={st.nextWeek}
                  disabled={st.weekOffset === 0}
                />
              </>
            )}
          </div>
        </div>
        <BarChart bars={st.bars} label={`${barTitle} 막대그래프(분)`} />
      </div>

      <ReadingCalendar
        year={st.month.y}
        month={st.month.m}
        cells={st.cells}
        canNext={!st.isThisMonth}
        onPrev={st.prevMonth}
        onNext={st.nextMonth}
      />

      <p className="-mt-3 text-sm text-ink-muted">지금까지 완독한 책 {st.finishedCount}권</p>

      <ExportPanel />
    </section>
  );
}
