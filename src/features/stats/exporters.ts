// 내 기록 내보내기·백업·복원(W-04, C-01). 모든 파일은 기기 안에서 만들어 바로 내려받습니다.
import { db } from '../../db/db';
import { getSettings } from '../../db/settings';
import type { Book, SettingsRow } from '../../db/types';
import {
  BACKUP_JSON,
  BACKUP_SCHEMA,
  backupRoot,
  coverFileName,
  exportFileName,
  parseBackup,
  readingLog,
  toLocalIso,
  type Backup,
  type BackupBook,
} from '../../lib/exportData';
import { isZip, makeZip, readZip, type ZipEntry } from '../../lib/zip';

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

/** 예전 JSON 백업(표지가 base64로 들어 있음)을 읽을 때 */
function fromBase64(base64: string, type: string): Blob {
  const text = atob(base64);
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i);
  return new Blob([bytes], { type });
}

async function backupData(
  now: Date,
  cover: (book: Book, blob: Blob) => Promise<BackupBook['cover']>,
): Promise<Backup> {
  const [books, sessions, presets, settings] = await Promise.all([
    db.books.toArray(),
    db.sessions.toArray(),
    db.presets.toArray(),
    getSettings(),
  ]);
  const backupBooks: BackupBook[] = await Promise.all(
    books.map(async (book) => {
      const { coverBlob, ...rest } = book;
      const c = coverBlob && (await cover(book, coverBlob));
      return c ? { ...rest, cover: c } : rest;
    }),
  );
  return {
    schema: BACKUP_SCHEMA,
    exportedAt: toLocalIso(now),
    books: backupBooks,
    sessions,
    presets,
    settings,
  };
}

/**
 * 전체 백업(ZIP 하나): backup.json + covers/책ID.jpg.
 * 표지는 이미 압축된 그림이라 압축하지 않고 담습니다. 음악 파일은 용량 때문에 넣지 않습니다.
 */
export async function exportBackup(now = new Date()) {
  const covers: ZipEntry[] = [];
  const backup = await backupData(now, async (book, blob) => {
    const file = coverFileName(book.id, blob.type);
    covers.push({ name: file, data: new Uint8Array(await blob.arrayBuffer()) });
    return { type: blob.type, file };
  });
  const json = new TextEncoder().encode(JSON.stringify(backup, null, 2));
  const zip = makeZip([{ name: BACKUP_JSON, data: json }, ...covers], now);
  downloadBlob(
    new Blob([zip as BlobPart], { type: 'application/zip' }),
    exportFileName('백업', 'zip', now),
  );
}

/** 기록만 백업(JSON): 표지를 빼서 가볍습니다. */
export async function exportRecords(now = new Date()) {
  const backup = await backupData(now, async () => undefined);
  downloadBlob(jsonBlob(backup), exportFileName('기록백업', 'json', now));
}

/** 백업 파일(ZIP 또는 JSON)을 읽어 표지까지 Blob으로 되돌립니다. */
async function readBackupFile(file: File): Promise<{ backup: Backup; books: Book[] }> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let backup: Backup;
  let coverOf: (path: string) => Uint8Array | undefined = () => undefined;
  if (isZip(bytes)) {
    const files = await readZip(bytes);
    const root = backupRoot([...files.keys()]);
    if (root === undefined) throw new Error('ZIP 안에 빗소리 서재 백업이 없어요.');
    backup = parseBackup(new TextDecoder().decode(files.get(root + BACKUP_JSON)));
    coverOf = (path) => files.get(root + path);
  } else {
    backup = parseBackup(new TextDecoder().decode(bytes));
  }
  const books: Book[] = backup.books.map(({ cover, ...rest }) => {
    if (cover?.base64) return { ...rest, coverBlob: fromBase64(cover.base64, cover.type) };
    const data = cover?.file ? coverOf(cover.file) : undefined;
    return data
      ? { ...rest, coverBlob: new Blob([data as BlobPart], { type: cover!.type }) }
      : rest;
  });
  return { backup, books };
}

/**
 * 백업 파일 복원: 같은 ID는 백업 내용으로 덮어쓰고, 지금 기기에만 있는 기록은 그대로 둡니다.
 * 백업에 표지가 없는 책(기록만 백업)은 이 기기에 있던 표지를 그대로 둡니다.
 */
export async function restoreBackup(file: File) {
  const { backup, books } = await readBackupFile(file);
  const settings = { ...(await getSettings()), ...backup.settings, key: 'app' } as SettingsRow;
  await db.transaction('rw', [db.books, db.sessions, db.presets, db.settings], async () => {
    const existing = await db.books.bulkGet(books.map((b) => b.id));
    const merged = books.map((b, i) =>
      b.coverBlob || !existing[i]?.coverBlob ? b : { ...b, coverBlob: existing[i]!.coverBlob },
    );
    await db.books.bulkPut(merged);
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
