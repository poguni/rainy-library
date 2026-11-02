import type { Bar } from '../../lib/stats';
import { formatDuration } from '../../lib/time';

const HEIGHT = 96; // 막대 영역 높이(px)

/** 막대그래프(시안 '이번 주 독서'): 지난 칸은 옅은 색, 오늘(이번 달)은 진한 색, 0분은 가는 선 */
export function BarChart({ bars, label }: { bars: Bar[]; label: string }) {
  const max = Math.max(...bars.map((b) => b.minutes), 1);
  return (
    <ul aria-label={label} className="grid grid-flow-col auto-cols-fr items-end gap-2.5">
      {bars.map((b) => {
        const h = b.minutes > 0 ? Math.max(6, Math.round((b.minutes / max) * HEIGHT)) : 3;
        return (
          <li key={b.key} className="flex flex-col items-center gap-1">
            <span className="text-xs text-ink-muted tabular-nums" aria-hidden="true">
              {b.minutes > 0 ? b.minutes : ''}
            </span>
            <div className="flex w-full items-end" style={{ height: HEIGHT }} aria-hidden="true">
              <div
                className={`w-full ${
                  b.minutes === 0
                    ? 'rounded-sm bg-line'
                    : `rounded-t-[4px] rounded-b-[1px] ${b.current ? 'bg-accent' : 'bg-accent-tint'}`
                }`}
                style={{ height: h }}
              />
            </div>
            <span className={`text-xs ${b.current ? 'font-bold text-ink' : 'text-ink-muted'}`}>
              {b.label}
              <span className="sr-only">
                {' '}
                {b.future ? '아직 오지 않음' : formatDuration(b.minutes * 60)}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
