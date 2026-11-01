import { useState } from 'react';
import { PageStepper } from '../../components/PageStepper';
import { checkStartPage } from '../../lib/pages';
import { formatDuration } from '../../lib/time';
import { ROUNDS_PER_CYCLE, roundInCycle, type TimerMode } from '../../lib/timer';
import { DEFAULT_SETTINGS } from '../../db/settings';
import { TimerFace } from '../../theme/parts';
import { BookPickerSheet } from './BookPickerSheet';
import { CurrentBookCard } from './CurrentBookCard';
import { EndSessionSheet } from './EndSessionSheet';
import { ModeSwitch } from './ModeSwitch';
import { TimerControls } from './TimerControls';
import { TimerHeader } from './TimerHeader';
import { useCurrentBook } from './useCurrentBook';
import { useTimer } from './useTimer';

export function TimerPage() {
  const timer = useTimer();
  const cur = useCurrentBook(timer.active?.bookId);
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [startEdit, setStartEdit] = useState<{ bookId: string; value: string } | null>(null);
  const [startChecked, setStartChecked] = useState(false);
  const [sheet, setSheet] = useState<'none' | 'pick' | 'end'>('none');
  const [resumeAfterSheet, setResumeAfterSheet] = useState(false);
  const [message, setMessage] = useState('');

  const durations = cur.settings ?? DEFAULT_SETTINGS;
  const book = cur.book;
  const active = timer.active;
  const view = timer.view;

  const startValue =
    book && startEdit?.bookId === book.id ? startEdit.value : String(cur.suggestedStartPage ?? '');
  const startProblem = book ? checkStartPage(Number(startValue || NaN), book.totalPages) : null;
  const startError =
    startChecked && startProblem
      ? startProblem === 'over-total'
        ? `이 책은 ${book?.totalPages}쪽까지 있어요.`
        : '시작 쪽수를 1 이상의 숫자로 적어 주세요.'
      : undefined;

  const start = () => {
    setStartChecked(true);
    if (!book || startProblem) return;
    setMessage('');
    timer.start(mode, book.id, Number(startValue), durations);
    setStartChecked(false);
    setStartEdit(null);
  };

  const openEnd = () => {
    setResumeAfterSheet(!timer.paused);
    timer.pause();
    setSheet('end');
  };

  const closeEnd = () => {
    setSheet('none');
    if (resumeAfterSheet) timer.resume();
  };

  const faceMode = view?.mode ?? mode;
  const facePhase = view?.phase ?? 'focus';

  return (
    <section className="flex flex-col gap-[18px]">
      <TimerHeader />
      <CurrentBookCard
        book={book}
        startPage={active ? active.startPage : Number(startValue) || undefined}
        canChange={!active && cur.reading.length > 1}
        onChange={() => setSheet('pick')}
      />

      {!active && book && (
        <div className="flex flex-col gap-3">
          <ModeSwitch value={mode} onChange={setMode} />
          <PageStepper
            id="start-page"
            label="시작 쪽수"
            value={startValue}
            onChange={(v) => setStartEdit({ bookId: book.id, value: v })}
            error={startError}
          />
        </div>
      )}

      <TimerFace
        mode={faceMode}
        phase={facePhase}
        displaySec={active ? timer.displaySec : faceMode === 'free' ? 0 : durations.focusMin * 60}
        totalSec={active ? timer.totalSec : durations.focusMin * 60}
        round={roundInCycle(view?.round ?? 1)}
        rounds={ROUNDS_PER_CYCLE}
        paused={timer.paused}
      />

      <TimerControls
        state={!active ? 'idle' : timer.paused ? 'paused' : 'running'}
        skipLabel={faceMode === 'free' ? null : facePhase === 'focus' ? '쉬어가기' : '다시 읽기'}
        disabled={!active && (!book || cur.loading)}
        onStart={start}
        onPause={timer.pause}
        onResume={timer.resume}
        onEnd={openEnd}
        onSkip={timer.skip}
      />

      <p role="status" className="min-h-5 text-center text-sm text-ink-muted">
        {message}
      </p>

      {sheet === 'pick' && (
        <BookPickerSheet
          books={cur.reading}
          currentId={book?.id}
          onPick={(id) => void cur.choose(id)}
          onClose={() => setSheet('none')}
        />
      )}
      {sheet === 'end' && active && book && (
        <EndSessionSheet
          bookTitle={book.title}
          totalPages={book.totalPages}
          startPage={active.startPage}
          focusSec={timer.focusSec}
          onClose={closeEnd}
          onSave={async (endPage) => {
            const saved = await timer.finish(endPage);
            setSheet('none');
            if (!saved) return;
            const pages = endPage === null ? '' : `${endPage - saved.startPage!}쪽, `;
            setMessage(`기록했어요. ${pages}${formatDuration(saved.focusSeconds)} 읽었어요.`);
          }}
        />
      )}
    </section>
  );
}
