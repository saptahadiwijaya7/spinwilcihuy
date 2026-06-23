import { normalizeNames } from "./randomizer";

function extractSheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match?.[1] ?? null;
}

function extractGid(url: string): string {
  const match = url.match(/[?&#]gid=(\d+)/);
  return match?.[1] ?? "0";
}

export async function importPublicGoogleSheet(url: string): Promise<string[]> {
  const id = extractSheetId(url);
  if (!id) throw new Error("URL Google Sheet tidak valid.");

  const gid = extractGid(url);
  const csvUrl = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
  const response = await fetch(csvUrl);

  if (!response.ok) {
    throw new Error("Gagal membaca Google Sheet. Pastikan sheet bisa diakses publik atau Anyone with the link.");
  }

  const text = await response.text();
  return normalizeNames(text.split(/[\n,;\t]+/));
}

export function buildGoogleSheetCsv(rows: Record<string, string | number>[]): string {
  const headers = Object.keys(rows[0] ?? { Nama: "" });
  const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))].join("\n");
}
