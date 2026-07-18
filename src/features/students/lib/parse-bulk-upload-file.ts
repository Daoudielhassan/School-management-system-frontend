/**
 * Client-side preview parser for the bulk-upload file (CSV or XLSX) — reads
 * the same way regardless of format via SheetJS, so the user sees a row
 * count + sample and a missing-header warning before any network call. The
 * authoritative parse still happens server-side (`StudentFileParser`,
 * Apache POI/OpenCSV); this is purely a fast local preview.
 */
import * as XLSX from 'xlsx';
import { STUDENT_UPLOAD_REQUIRED_HEADERS } from '../constants';

export interface BulkUploadPreview {
  headers: string[];
  missingHeaders: string[];
  rows: string[][];
  totalRows: number;
}

function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]/g, '');
}

export async function parseBulkUploadFile(file: File): Promise<BulkUploadPreview> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, blankrows: false, defval: '' });

  if (rows.length === 0) {
    return { headers: [], missingHeaders: [...STUDENT_UPLOAD_REQUIRED_HEADERS], rows: [], totalRows: 0 };
  }

  const [headerRow, ...dataRows] = rows;
  const normalizedHeaders = headerRow.map(normalizeHeader);
  const missingHeaders = STUDENT_UPLOAD_REQUIRED_HEADERS.filter((h) => !normalizedHeaders.includes(h));

  return {
    headers: headerRow.map((h) => String(h ?? '')),
    missingHeaders,
    rows: dataRows.slice(0, 5).map((row) => row.map((cell) => String(cell ?? ''))),
    totalRows: dataRows.length,
  };
}
