import "server-only";
import { BIRDEP } from "@/lib/birdep";
import { normalizeNim } from "@/lib/nim";

export type ParticipantLookup =
  | { found: true; nama: string; nim: string; hasil: string; divisi: string }
  | { found: false };

// Sentinel `hasil` value for a participant whose result isn't ready to
// announce yet (kept found:true — they exist, just nothing to show). Must
// stay in sync with the matching check in AcceptancePortal.tsx's
// classifyHasil(); not imported directly since that file is a client
// component and this module is server-only.
export const PENDING_HASIL = "BELUM TERSEDIA";

// Manual corrections applied on top of the spreadsheet — used when a result
// needs fixing faster than the sheet can be edited, or when a participant's
// result exists but isn't ready to announce (set it to PENDING_HASIL).
// Keyed by Birdep tab + normalized nama. Deliberately tiny: this is not a
// parallel dataset, just a patch over specific rows.
const RESULT_OVERRIDES: Record<string, Record<string, string>> = {};

function applyResultOverride(result: ParticipantLookup): ParticipantLookup {
  if (!result.found) return result;
  const override = RESULT_OVERRIDES[result.divisi]?.[result.nama.trim().toUpperCase()];
  return override ? { ...result, hasil: override } : result;
}

function findColumn(headerRow: string[], match: (cell: string) => boolean) {
  return headerRow.findIndex((cell) => match((cell ?? "").trim().toLowerCase()));
}

// Each Birdep tab has a title row ("HASIL WWC SEKOLAH ORMAWA") above its
// real header, and tabs don't necessarily share a column layout (some carry
// No/Email columns, some don't) — so columns are located by header text per
// tab instead of assumed by fixed position.
function findParticipantInRows(values: string[][], nim: string, division: string): ParticipantLookup {
  const headerRowIndex = values.findIndex((row) =>
    row.some((cell) => (cell ?? "").trim().toLowerCase() === "nim"),
  );
  if (headerRowIndex === -1) return { found: false };

  const headerRow = values[headerRowIndex];
  const namaCol = findColumn(headerRow, (cell) => cell.includes("nama"));
  const nimCol = findColumn(headerRow, (cell) => cell === "nim");
  // `includes` (not `===`) so variant headers like "HASIL SELEKSI" work too.
  const hasilCol = findColumn(headerRow, (cell) => cell.includes("hasil"));
  if (namaCol === -1 || nimCol === -1 || hasilCol === -1) return { found: false };

  for (let i = headerRowIndex + 1; i < values.length; i++) {
    const row = values[i];
    const rowNim = (row[nimCol] ?? "").trim();
    if (!rowNim) continue;
    if (normalizeNim(rowNim) === nim) {
      return {
        found: true,
        nama: (row[namaCol] ?? "").trim(),
        nim: rowNim,
        hasil: (row[hasilCol] ?? "").trim(),
        divisi: division,
      };
    }
  }

  return { found: false };
}

// Minimal RFC 4180 CSV parser (quoted fields, embedded commas/quotes, and
// newlines inside quoted cells, which the raw export does emit). Kept local
// rather than pulling in a dependency for something this small.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(cur);
      cur = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
    } else {
      cur += c;
    }
  }
  row.push(cur);
  rows.push(row);
  return rows;
}

// No Google Cloud project, API key, or billing required: the spreadsheet is
// shared as "Anyone with the link: Viewer", which lets its own (undocumented
// but long-stable) endpoints be read anonymously. See PROJECT_STATE.md.
//
// Tabs are read by gid through the raw CSV export, NOT by name through
// gviz/tq: gviz silently answers an unknown tab name with the FIRST tab's
// data (a participant would be attributed to the wrong Birdep), and it
// blanks out cells whose type doesn't match its guessed column type. The
// export returns raw cell text, but needs a gid — so the tab name → gid map
// is read first from the spreadsheet's htmlview page.
const SPREADSHEET_BASE = "https://docs.google.com/spreadsheets/d";

// Short revalidation window: keeps repeated checks fast without ever
// shipping the dataset to the client, and stays fresh enough for a results
// announcement (no manual cache-busting needed).
const FETCH_OPTIONS = { next: { revalidate: 15 } };

async function fetchTabGids(spreadsheetId: string): Promise<Map<string, string>> {
  const response = await fetch(`${SPREADSHEET_BASE}/${spreadsheetId}/htmlview`, FETCH_OPTIONS);
  if (!response.ok) {
    throw new Error(`Google Sheets htmlview request failed: ${response.status}`);
  }
  const html = await response.text();

  const gids = new Map<string, string>();
  for (const match of html.matchAll(/items\.push\(\{name: "((?:[^"\\]|\\.)*)",[^}]*?gid: "(\d+)"/g)) {
    gids.set(JSON.parse(`"${match[1]}"`) as string, match[2]);
  }

  // Every spreadsheet has at least one tab, so an empty map means Google
  // changed this page's markup — fail loudly rather than report "not found"
  // for everyone.
  if (gids.size === 0) {
    throw new Error("Could not read the spreadsheet's tab list from htmlview.");
  }
  return gids;
}

// Sheet tabs that use a descriptive name instead of a BIRDEP short name
// (e.g. "Medbrand Legislatif" for Badan Media dan Branding legislatif) —
// keyed by the sheet's tab name, pointing to the BIRDEP tab it belongs to.
const TAB_ALIASES: Record<string, string> = {
  "Medbrand Legislatif": "Badmedbrnd",
  BINEKS: "Badintekst",
  KOMANG: "Komanggar",
  Legislasi: "Komleg",
};

// Resolve a sheet tab name to its BIRDEP tab: exact alias first, then a
// case-insensitive match on the BIRDEP short names (the committee writes
// them uppercase in the sheet, e.g. SENBUD/KOMIT/ADKESMAH).
function resolveBirdepTab(sheetName: string): string | undefined {
  const aliased = TAB_ALIASES[sheetName];
  if (aliased) return aliased;
  const lower = sheetName.toLowerCase();
  return BIRDEP.find(({ tab }) => tab.toLowerCase() === lower)?.tab;
}

export async function findParticipantByNim(rawNim: string): Promise<ParticipantLookup> {
  const nim = normalizeNim(rawNim);
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEETS_ID environment variable.");
  }

  const gids = await fetchTabGids(spreadsheetId);
  // A Birdep whose tab hasn't been added to the sheet yet is skipped, not an
  // error — results can be published Birdep by Birdep. A tab that exists but
  // doesn't resolve to any BIRDEP (untitled placeholders like "Sheet1", a
  // scratch tab) is also skipped.
  const tabs = BIRDEP.flatMap(({ tab }) => {
    for (const [sheetName, gid] of gids) {
      if (resolveBirdepTab(sheetName) === tab) return [{ tab, gid }];
    }
    return [];
  });

  const responses = await Promise.all(
    tabs.map(({ gid }) =>
      fetch(`${SPREADSHEET_BASE}/${spreadsheetId}/export?format=csv&gid=${gid}`, FETCH_OPTIONS),
    ),
  );

  for (let i = 0; i < responses.length; i++) {
    const response = responses[i];
    if (!response.ok) {
      throw new Error(`Google Sheets export request failed: ${response.status}`);
    }
    const text = await response.text();
    const result = applyResultOverride(findParticipantInRows(parseCsv(text), nim, tabs[i].tab));
    if (result.found) return result;
  }

  return { found: false };
}
