// @vitest-environment node
import ExcelJS from 'exceljs';
import type { Book, Session } from '../../db/types';
import { buildWorkbook } from './xlsxWorkbook';

const book: Book = {
  id: 'book_01',
  title: '작별하지 않는다',
  author: '한강',
  totalPages: 320,
  status: 'reading',
  currentPage: 142,
  createdAt: new Date(2026, 9, 1).toISOString(),
  quotes: [
    {
      id: 'quote_1',
      text: '첫 줄\n둘째 줄',
      page: 77,
      createdAt: new Date(2026, 9, 20).toISOString(),
    },
  ],
};
const session: Session = {
  id: 'ses_1',
  bookId: 'book_01',
  startedAt: new Date(2026, 9, 29, 21, 5).toISOString(),
  endedAt: new Date(2026, 9, 29, 21, 55).toISOString(),
  focusSeconds: 3000,
  startPage: 120,
  endPage: 142,
  mode: 'pomodoro',
};

describe('buildWorkbook', () => {
  it('세 시트에 머리글 서식·틀 고정·필터·날짜가 들어간다', async () => {
    const blob = await buildWorkbook([book], [session], new Date(2026, 9, 30));
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await blob.arrayBuffer());

    expect(wb.worksheets.map((w) => w.name)).toEqual(['책 목록', '독서 기록', '책 속 한 문장']);
    for (const ws of wb.worksheets) {
      expect(ws.getRow(1).getCell(1).font?.bold).toBe(true);
      expect(ws.views[0]).toMatchObject({ state: 'frozen', ySplit: 1 });
      expect(ws.autoFilter).toBeTruthy();
      ws.columns.forEach((c) => expect(c.width).toBeGreaterThanOrEqual(10));
    }

    const log = wb.getWorksheet('독서 기록')!;
    expect(log.getCell('D2').value).toBe('작별하지 않는다');
    const start = log.getCell('B2').value as Date;
    expect([start.getUTCHours(), start.getUTCMinutes()]).toEqual([21, 5]); // 기기 시각 그대로
    expect(log.getCell('B2').numFmt).toBe('hh:mm');
    expect(log.getCell('I2').value).toBeCloseTo(0.44, 2);

    const quotes = wb.getWorksheet('책 속 한 문장')!;
    expect(quotes.getCell('A2').value).toBe('작별하지 않는다');
    expect(quotes.getCell('C2').value).toBe(77);
    expect(quotes.getCell('D2').value).toBe('첫 줄\n둘째 줄');
    expect(quotes.getCell('D2').alignment?.wrapText).toBe(true);
    expect(quotes.getCell('E2').numFmt).toBe('yyyy-mm-dd');
  });
});
