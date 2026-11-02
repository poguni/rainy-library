import { Link } from 'react-router-dom';
import { db } from '../../db/db';
import { useLiveQuery } from '../../db/useLiveQuery';
import { bookTotals, progressPercent } from '../../lib/books';
import { bookAverageSpeed, formatSpeed, sessionPages } from '../../lib/reading';
import { dayKey } from '../../lib/stats';
import { formatDuration } from '../../lib/time';
import { PrintQuotes } from './PrintQuotes';

const STATUS = { reading: '읽는 중', finished: '완독', paused: '보류' } as const;
const th = 'border-b border-ink px-1.5 py-1 text-left font-bold';
const td = 'border-b border-line px-1.5 py-1 align-top';

const pad = (n: number) => String(n).padStart(2, '0');
/** "21:05" */
const hm = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** 인쇄용 '독서 기록'(A4): 책별 요약, 날짜별 기록, 책 속 한 문장. 브라우저 인쇄에서 'PDF로 저장'을 고르면 파일이 됩니다. */
export function PrintPage() {
  const books = useLiveQuery(() => db.books.orderBy('createdAt').toArray(), []);
  const sessions = useLiveQuery(() => db.sessions.orderBy('startedAt').toArray(), []);
  if (!books || !sessions) return null;

  const title = new Map(books.map((b) => [b.id, b.title]));
  const totalSec = sessions.reduce((s, x) => s + x.focusSeconds, 0);
  const first = sessions[0] && dayKey(new Date(sessions[0].startedAt));
  const last = sessions.at(-1) && dayKey(new Date(sessions.at(-1)!.startedAt));

  return (
    <article className="print-doc flex flex-col gap-5 text-sm">
      <div className="flex items-center justify-between gap-2 print:hidden">
        <Link to="/stats" className="flex min-h-11 items-center text-sm text-accent">
          ‹ 기록으로
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="press min-h-11 rounded-full bg-accent px-5 text-md text-on-accent shadow-[var(--shadow-primary)]"
        >
          인쇄 / PDF로 저장
        </button>
      </div>
      <p className="-mt-3 text-sm text-ink-muted print:hidden">
        인쇄 창의 ‘대상(프린터)’에서 ‘PDF로 저장’을 고르면 파일로 저장돼요. 용지는 A4예요.
      </p>

      <header className="flex flex-col gap-1 border-b-2 border-ink pb-2">
        <h1 className="font-display text-xl font-bold">빗소리 서재 · 독서 기록</h1>
        <p className="text-ink-muted">
          {first ? `${first} ~ ${last}` : '기록 없음'} · 모두 {formatDuration(totalSec)} · 기록{' '}
          {sessions.length}개 · 완독 {books.filter((b) => b.status === 'finished').length}권
          <span className="ml-2">(뽑은 날 {dayKey(new Date())})</span>
        </p>
      </header>

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-md font-bold">책별 요약</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={th}>제목</th>
              <th className={th}>저자</th>
              <th className={th}>상태</th>
              <th className={`${th} text-right`}>진행</th>
              <th className={`${th} text-right`}>독서 시간</th>
              <th className={`${th} text-right`}>기록</th>
              <th className={`${th} text-right`}>평균 속도</th>
            </tr>
          </thead>
          <tbody>
            {books.map((b) => {
              const t = bookTotals(sessions, b.id);
              const speed = bookAverageSpeed(sessions, b.id);
              return (
                <tr key={b.id} className="break-inside-avoid">
                  <td className={td}>{b.title}</td>
                  <td className={td}>{b.author}</td>
                  <td className={`${td} whitespace-nowrap`}>{STATUS[b.status]}</td>
                  <td className={`${td} text-right whitespace-nowrap tabular-nums`}>
                    {b.currentPage}/{b.totalPages}쪽 ({progressPercent(b.currentPage, b.totalPages)}
                    %)
                  </td>
                  <td className={`${td} text-right whitespace-nowrap`}>
                    {formatDuration(t.focusSeconds)}
                  </td>
                  <td className={`${td} text-right tabular-nums`}>{t.sessionCount}</td>
                  <td className={`${td} text-right whitespace-nowrap`}>
                    {speed === null ? '—' : formatSpeed(speed)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-md font-bold">날짜별 독서 기록</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={th}>날짜</th>
              <th className={th}>시각</th>
              <th className={th}>책</th>
              <th className={`${th} text-right`}>쪽</th>
              <th className={`${th} text-right`}>읽은 쪽</th>
              <th className={`${th} text-right`}>시간</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => {
              const pages = sessionPages(s);
              return (
                <tr key={s.id} className="break-inside-avoid">
                  <td className={`${td} whitespace-nowrap tabular-nums`}>
                    {dayKey(new Date(s.startedAt))}
                  </td>
                  <td className={`${td} whitespace-nowrap tabular-nums`}>
                    {hm(s.startedAt)}~{hm(s.endedAt)}
                  </td>
                  <td className={td}>{title.get(s.bookId) ?? '(지운 책)'}</td>
                  <td className={`${td} text-right whitespace-nowrap tabular-nums`}>
                    {s.startPage !== null && s.endPage !== null
                      ? `${s.startPage}–${s.endPage}`
                      : '—'}
                  </td>
                  <td className={`${td} text-right tabular-nums`}>{pages ?? '—'}</td>
                  <td className={`${td} text-right whitespace-nowrap`}>
                    {formatDuration(s.focusSeconds)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <PrintQuotes books={books} />
    </article>
  );
}
