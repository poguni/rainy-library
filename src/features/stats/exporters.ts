// 내 기록 내보내기·백업·복원(W-04, C-01). 모든 파일은 기기 안에서 만들어 바로 내려받습니다.
import { db } from '../../db/db';
import { getSettings } from '../../db/settings';
import type { Book, SettingsRow } from '../../db/types';
import {
  BACKUP_SCHEMA,
  exportFileName,
  parseBackup,
  readingLog,
  toLocalIso,
  type Backup,
  type BackupBook,
} from '../../lib/exportData';

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const jsonBlob = (data: unknown) =>
  new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

async function toBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let text = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    text += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(text);
}

function fromBase64(base64: string, type: string): Blob {
  const text = atob(base64);
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i);
  return new Blob([bytes], { type });
}

/** 전체 백업: 책(표지 포함)·세션·프리셋·설정. 음악 파일은 용량 때문에 넣지 않습니다. */
export async function exportBackup(now = new Date()) {
  const [books, sessions, presets, settings] = await Promise.all([
    db.books.toArray(),
    db.sessions.toArray(),
    db.presets.toArray(),
    getSettings(),
  ]);
  const backupBooks: BackupBook[] = await Promise.all(
    books.map(async ({ coverBlob, ...rest }) =>
      coverBlob
        ? { ...rest, cover: { type: coverBlob.type, base64: await toBase64(coverBlob) } }
        : rest,
    ),
  );
  const backup: Backup = {
    schema: BACKUP_SCHEMA,
    exportedAt: toLocalIso(now),
    books: backupBooks,
    sessions,
    presets,
    settings,
  };
  downloadBlob(jsonBlob(backup), exportFileName('백업', 'json', now));
}

/** 백업 파일 복원: 같은 ID는 백업 내용으로 덮어쓰고, 지금 기기에만 있는 기록은 그대로 둡니다. */
export async function restoreBackup(file: File) {
  const backup = parseBackup(await file.text());
  const books: Book[] = backup.books.map(({ cover, ...rest }) =>
    cover ? { ...rest, coverBlob: fromBase64(cover.base64, cover.type) } : rest,
  );
  const settings = { ...(await getSettings()), ...backup.settings, key: 'app' } as SettingsRow;
  await db.transaction('rw', [db.books, db.sessions, db.presets, db.settings], async () => {
    await db.books.bulkPut(books);
    await db.sessions.bulkPut(backup.sessions);
    await db.presets.bulkPut(backup.presets);
    await db.settings.put(settings);
  });
  return { books: books.length, sessions: backup.sessions.length };
}

/** 4-1 독서 연대기용 JSON(PRD 8.3) */
export async function exportChronicle(now = new Date()) {
  const [books, sessions] = await Promise.all([db.books.toArray(), db.sessions.toArray()]);
  downloadBlob(jsonBlob(readingLog(books, sessions, now)), exportFileName('연대기', 'json', now));
}

/** 엑셀 파일. exceljs는 이 버튼을 누를 때만 불러옵니다. */
export async function exportXlsx(now = new Date()) {
  const [{ buildWorkbook }, books, sessions] = await Promise.all([
    import('./xlsxWorkbook'),
    db.books.toArray(),
    db.sessions.toArray(),
  ]);
  const blob = await buildWorkbook(books, sessions, now);
  downloadBlob(blob, exportFileName('독서기록', 'xlsx', now));
}
