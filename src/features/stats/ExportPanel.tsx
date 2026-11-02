import { useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BottomSheet } from '../../components/BottomSheet';
import { exportBackup, exportChronicle, exportXlsx, restoreBackup } from './exporters';

const rowClass =
  'press flex min-h-14 w-full flex-col justify-center gap-0.5 border-b border-line px-1 py-2.5 text-left last:border-b-0 disabled:opacity-50';

function Row({ title, desc }: { title: string; desc: string }) {
  return (
    <>
      <span className="text-md text-ink">{title}</span>
      <span className="text-sm text-ink-muted">{desc}</span>
    </>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-sm text-ink-muted">{title}</h3>
      <div className="flex flex-col rounded-[var(--radius-lg)] border border-line bg-surface px-3">
        {children}
      </div>
    </div>
  );
}

/** 내 기록 내보내기(TASKS 7단계): 사람용(엑셀·인쇄) / 컴퓨터용(연대기·백업·복원) */
export function ExportPanel() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /** job이 문장을 돌려주면 그 문장을, 아니면 done을 보여 줍니다. */
  const run = async (job: () => Promise<unknown>, done: string, fail: string) => {
    setBusy(true);
    setMessage('');
    try {
      const result = await job();
      setMessage(typeof result === 'string' ? result : done);
    } catch (err) {
      console.error('[export]', err);
      setMessage(err instanceof Error && err.message.endsWith('요.') ? err.message : fail);
    } finally {
      setBusy(false);
    }
  };

  const restore = (file: File) =>
    run(
      async () => {
        const r = await restoreBackup(file);
        return `책 ${r.books}권, 기록 ${r.sessions}개를 되살렸어요.`;
      },
      '',
      '백업을 불러오지 못했어요.',
    ).then(() => setRestoreFile(null));

  return (
    <section className="flex flex-col gap-3" aria-labelledby="export-title">
      <h2 id="export-title" className="font-display text-md font-bold">
        내 기록 내보내기
      </h2>
      <Group title="보기 좋은 문서로">
        <button
          type="button"
          disabled={busy}
          className={rowClass}
          onClick={() =>
            void run(exportXlsx, '엑셀 파일을 저장했어요.', '엑셀 파일을 만들지 못했어요.')
          }
        >
          <Row title="엑셀 파일(xlsx)" desc="책 목록과 독서 기록을 표로 정리해요." />
        </button>
        <Link to="/stats/print" className={rowClass}>
          <Row title="인쇄 / PDF로 저장" desc="A4 한 장에 맞춘 독서 기록 화면을 열어요." />
        </Link>
      </Group>
      <Group title="다른 앱·기기로 옮기기">
        <button
          type="button"
          disabled={busy}
          className={rowClass}
          onClick={() =>
            void run(exportChronicle, '연대기용 파일을 저장했어요.', '파일을 만들지 못했어요.')
          }
        >
          <Row title="독서 연대기용 파일(JSON)" desc="4-1 독서 연대기 앱에 넣을 수 있어요." />
        </button>
        <button
          type="button"
          disabled={busy}
          className={rowClass}
          onClick={() =>
            void run(exportBackup, '백업 파일을 저장했어요.', '백업 파일을 만들지 못했어요.')
          }
        >
          <Row title="전체 백업(JSON)" desc="책·표지·기록·프리셋·설정. 음악 파일은 빠져요." />
        </button>
        <button
          type="button"
          disabled={busy}
          className={rowClass}
          onClick={() => fileRef.current?.click()}
        >
          <Row title="백업 불러오기" desc="백업 파일로 기록을 되살려요." />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          aria-label="백업 파일 고르기"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setRestoreFile(f);
            e.target.value = '';
          }}
        />
      </Group>
      <p role="status" className="min-h-5 text-sm text-ink-muted">
        {busy ? '잠시만 기다려 주세요…' : message}
      </p>

      {restoreFile && (
        <BottomSheet title="백업에서 되살릴까요?" onClose={() => setRestoreFile(null)}>
          <p className="mt-3 text-sm text-ink-muted">
            {restoreFile.name}
            <br />
            같은 책·기록은 백업 내용으로 바뀌고, 이 기기에만 있는 기록은 그대로 남아요.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRestoreFile(null)}
              className="press min-h-12 rounded-full border border-line-strong text-md text-ink"
            >
              그만두기
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void restore(restoreFile)}
              className="press min-h-12 rounded-full bg-accent text-md text-on-accent shadow-[var(--shadow-primary)]"
            >
              되살리기
            </button>
          </div>
        </BottomSheet>
      )}
    </section>
  );
}
