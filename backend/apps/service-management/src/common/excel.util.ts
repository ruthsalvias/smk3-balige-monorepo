import { BadRequestException } from '@nestjs/common';
import ExcelJS from 'exceljs';

/** Samakan penulisan header: buang teks dalam kurung, spasi, dan tanda baca. */
function normalizeKey(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function cellToString(value: ExcelJS.CellValue): string {
  if (value == null) return '';
  if (typeof value === 'object') {
    if ('text' in value && value.text != null) return String(value.text).trim();
    if ('result' in value && value.result != null) return String(value.result).trim();
    if (value instanceof Date) return value.toISOString().slice(0, 10);
  }
  return String(value).trim();
}

function sheetToMatrix(sheet: ExcelJS.Worksheet): string[][] {
  const matrix: string[][] = [];
  sheet.eachRow({ includeEmpty: false }, (row) => {
    const values = row.values as ExcelJS.CellValue[];
    const cells: string[] = [];
    for (let i = 1; i < values.length; i += 1) {
      cells.push(cellToString(values[i]));
    }
    matrix.push(cells);
  });
  return matrix;
}

/**
 * Baca sheet pertama sebagai daftar objek. Baris header dicari otomatis (maks 15
 * baris pertama) supaya template dengan judul dan catatan di atas tabel tetap terbaca.
 */
export async function readSheetRows(
  buffer: Buffer,
  headerHints: string[],
): Promise<Record<string, string>[]> {
  const book = new ExcelJS.Workbook();
  await book.xlsx.load(buffer as unknown as ExcelJS.Buffer);
  const sheet = book.worksheets[0];
  if (!sheet) throw new BadRequestException('File Excel tidak memiliki sheet');

  const matrix = sheetToMatrix(sheet);
  const hints = headerHints.map(normalizeKey);
  let headerIndex = -1;

  for (let i = 0; i < Math.min(matrix.length, 15); i += 1) {
    const cells = (matrix[i] || []).map(normalizeKey);
    const hits = hints.filter((hint) => cells.includes(hint)).length;
    if (hits >= 2) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    throw new BadRequestException(
      'Header kolom tidak ditemukan. Gunakan template resmi yang disediakan.',
    );
  }

  const headers = (matrix[headerIndex] || []).map((cell) => String(cell ?? '').trim());
  const rows: Record<string, string>[] = [];

  for (let i = headerIndex + 1; i < matrix.length; i += 1) {
    const cells = matrix[i] || [];
    if (cells.every((cell) => String(cell ?? '').trim() === '')) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (header) row[header] = String(cells[index] ?? '').trim();
    });
    rows.push(row);
  }

  return rows;
}

/** Tulis baris objek ke buffer .xlsx (sheet tunggal). */
export async function writeSheetBuffer(
  sheetName: string,
  rows: Record<string, unknown>[],
): Promise<Buffer> {
  const book = new ExcelJS.Workbook();
  const sheet = book.addWorksheet(sheetName);

  if (rows.length > 0) {
    const headers = Object.keys(rows[0]);
    sheet.addRow(headers);
    for (const row of rows) {
      sheet.addRow(headers.map((header) => row[header] ?? ''));
    }
  }

  const raw = await book.xlsx.writeBuffer();
  return Buffer.from(raw);
}

export function pickField(row: Record<string, string>, keys: string[]): string {
  const entries = Object.entries(row);
  for (const key of keys) {
    const target = normalizeKey(key);
    const found = entries.find(([header]) => normalizeKey(header) === target);
    if (found && found[1] !== '') return found[1];
  }
  return '';
}

/** Baris contoh bawaan template tidak boleh ikut terimpor. */
export function isContohRow(nama: string, identitas: string): boolean {
  const CONTOH_NAMA = ['budi santoso', 'abc'];
  const CONTOH_ID = ['1234567890', '098767890-098', '2024001'];
  return (
    CONTOH_NAMA.includes(nama.toLowerCase().trim()) &&
    CONTOH_ID.includes(identitas.toLowerCase().trim())
  );
}
