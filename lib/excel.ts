import * as XLSX from "xlsx";
import { normalizeNames } from "./randomizer";

export async function parseNameFile(file: File): Promise<string[]> {
  const lower = file.name.toLowerCase();

  if (lower.endsWith(".csv")) {
    const text = await file.text();
    return normalizeNames(text.split(/[\n,;\t]+/));
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { header: 1 });

  const names = rows
    .flatMap((row) => Object.values(row))
    .map((value) => String(value ?? ""));

  return normalizeNames(names);
}

export function exportRowsToExcel(filename: string, rows: Record<string, string | number>[]) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  XLSX.writeFile(workbook, filename);
}
