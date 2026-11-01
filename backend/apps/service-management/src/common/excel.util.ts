import { BadRequestException } from '@nestjs/common';
import ExcelJS from 'exceljs';

/** Samakan penulisan header: buang teks dalam kurung, spasi, dan tanda baca. */
function normalizeKey(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Membetulkan teks yang rusak akibat salah tafsir sandi karakter.
 *
 * Export Dapodik menulis byte UTF-8 seolah-olah Windows-1252, sehingga
 * "Rp1.000.001 – Rp3.000.000" tersimpan sebagai "Rp1.000.001 â€“ Rp3.000.000".
 * Langkahnya dibalik: tiap karakter dikembalikan ke byte Windows-1252 lalu
 * dibaca ulang sebagai UTF-8.
 *
 * Perbaikan hanya dipakai bila hasilnya benar-benar UTF-8 yang sah, jadi teks
 * yang memang sudah benar tidak ikut berubah.
 */
const CP1252_TINGGI: Record<number, number> = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a,
  0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92,
  0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c,
  0x017e: 0x9e, 0x0178: 0x9f,
};

export function perbaikiMojibake(teks: string): string {
  // Tanda khasnya selalu diawali salah satu dari karakter ini.
  if (!/[ÂÃâ]/.test(teks)) return teks;

  const byte: number[] = [];
  for (const huruf of teks) {
    const kode = huruf.codePointAt(0) ?? 0;
    if (kode <= 0xff) byte.push(kode);
    else if (CP1252_TINGGI[kode] !== undefined) byte.push(CP1252_TINGGI[kode]);
    else return teks; // ada karakter yang bukan hasil salah tafsir
  }

  try {
    const hasil = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(byte));
    return hasil || teks;
  } catch {
    return teks; // bukan UTF-8 yang sah, berarti teks aslinya memang begitu
  }
}

function cellToString(value: ExcelJS.CellValue): string {
  if (value == null) return '';
  if (typeof value === 'object') {
    if ('text' in value && value.text != null) return perbaikiMojibake(String(value.text).trim());
    if ('result' in value && value.result != null) return perbaikiMojibake(String(value.result).trim());
    if (value instanceof Date) return value.toISOString().slice(0, 10);
  }
  return perbaikiMojibake(String(value).trim());
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
 * Export Dapodik memakai header dua baris: baris pertama berisi grup seperti
 * "Data Ayah", baris kedua berisi sub-kolomnya ("Nama", "Pekerjaan", ...).
 * Keduanya digabung jadi "Ayah Nama", "Ayah Pekerjaan", dan seterusnya.
 *
 * Template sederhana berheader satu baris tidak terpengaruh: penggabungan
 * hanya berjalan kalau benar ada sel berawalan "Data ".
 */
function susunHeader(
  matrix: string[][],
  headerIndex: number,
): { headers: string[]; mulaiData: number } {
  const atas = (matrix[headerIndex] || []).map((cell) => String(cell ?? '').trim());
  const bawah = (matrix[headerIndex + 1] || []).map((cell) => String(cell ?? '').trim());

  const adaGrup = atas.some((cell) => /^data\s+\S/i.test(cell));
  if (!adaGrup) return { headers: atas, mulaiData: headerIndex + 1 };

  const lebar = Math.max(atas.length, bawah.length);
  const headers: string[] = [];
  let grup = '';

  for (let i = 0; i < lebar; i += 1) {
    const judul = atas[i] || '';
    const sub = bawah[i] || '';
    const cocokGrup = judul.match(/^data\s+(.+)$/i);

    if (cocokGrup) {
      grup = cocokGrup[1].trim();
      headers.push(sub ? `${grup} ${sub}` : grup);
    } else if (judul) {
      grup = '';
      headers.push(judul);
    } else {
      headers.push(grup && sub ? `${grup} ${sub}` : '');
    }
  }

  return { headers, mulaiData: headerIndex + 2 };
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

  const { headers, mulaiData } = susunHeader(matrix, headerIndex);
  const rows: Record<string, string>[] = [];

  for (let i = mulaiData; i < matrix.length; i += 1) {
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
