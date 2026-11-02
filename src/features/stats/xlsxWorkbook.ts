// exceljs로 xlsx 파일을 만듭니다. 이 파일은 내보내기 버튼을 누를 때만 불러옵니다(exporters.ts).
import ExcelJS from 'exceljs';
import type { Book, Session } from '../../db/types';
import {
  booksTable,
  columnWidths,
  quotesTable,
  sessionsTable,
  toExcelDate,
  type CellFormat,
  type SheetTable,
} from '../../lib/xlsxTable';

// 엑셀 파일 안의 서식이라 화면 토큰을 쓸 수 없습니다(머리글 바탕: 종이 서재 이끼색을 옅게).
const HEADER_FILL = 'FFE4EADF';
const HEADER_LINE = 'FFCFC3AE';

const NUM_FMT: Record<CellFormat, string | undefined> = {
  text: undefined,
  int: '0',
  speed: '0.00',
  percent: '0%',
  date: 'yyyy-mm-dd',
  time: 'hh:mm',
};

function addSheet(wb: ExcelJS.Workbook, table: SheetTable) {
  const widths = columnWidths(table);
  const ws = wb.addWorksheet(table.name, {
    views: [{ state: 'frozen', ySplit: 1 }], // 머리글 고정
  });
  ws.columns = table.columns.map((c, i) => ({ header: c.header, width: widths[i] }));
  for (const row of table.rows) {
    ws.addRow(row.map((v) => (v instanceof Date ? toExcelDate(v) : v)));
  }

  table.columns.forEach((c, i) => {
    const col = ws.getColumn(i + 1);
    col.numFmt = NUM_FMT[c.format] ?? '@';
    col.alignment = {
      vertical: 'middle',
      wrapText: c.wrap,
      horizontal: c.format === 'text' ? 'left' : 'center',
    };
  });

  const header = ws.getRow(1);
  header.height = 24;
  header.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false };
    cell.border = { bottom: { style: 'thin', color: { argb: HEADER_LINE } } };
    cell.numFmt = '@';
  });

  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: table.columns.length } };
}

export async function buildWorkbook(books: Book[], sessions: Session[], now: Date): Promise<Blob> {
  const wb = new ExcelJS.Workbook();
  wb.creator = '빗소리 서재';
  wb.created = now;
  addSheet(wb, booksTable(books, sessions, now));
  addSheet(wb, sessionsTable(books, sessions));
  addSheet(wb, quotesTable(books));
  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
