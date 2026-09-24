# PROJECT_STATE

Last Updated: 2026-09-25

---

# Project Overview

**Project Name**
Pengumuman Hasil Seleksi Sekolah Ormawa PKU (Acceptance Portal)

**Purpose**

Portal pengumuman hasil seleksi Sekolah Ormawa PKU 2026 — bukan landing
page, satu flow tunggal: masukkan NIM → verifikasi → reveal hasil (Nama,
NIM, Birdep, LOLOS/TIDAK LOLOS). Difork dari `web-penerimaan-serixart`
(Seri X Art 2026) dan direbrand penuh ke Sekolah Ormawa PKU.

Tech Stack:

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- motion (Framer Motion successor)

---

# Current Status

✅ Portal selesai & direbrand ke Sekolah Ormawa PKU (17 Birdep)
✅ Kontak Kadiv 17 Birdep terisi
⏳ Menunggu deploy (belum ada Vercel/domain)

---

# Architecture

Single-screen state machine di `AcceptancePortal.tsx`:

```
form (idle / invalid / not-found / server-error)
  → checking (~1.1s verification beat)
    → result (lolos / tidak-lolos / lainnya / pending)
```

Tidak ada navbar, tidak ada section lain, tidak ada dashboard/admin.

## Data layer

Sumber data: Google Sheets milik project owner, 17 tab — satu per Birdep
(`Internal`, `Medbrand`, `Ristek`, `Komit`, `Adkesmah`, `Akpres`,
`Kastrat`, `Peraga`, `PSDM`, `Senbud`, `SLH`, `Ekraf`, `Komleg`,
`Komanggar`, `Kompeng`, `Badintekst`, `Badmedbrnd`). NIM peserta hanya ada
di satu tab (Birdep yang dipilihnya), jadi lookup men-scan semua tab yang
sudah ada di sheet. Daftar Birdep + nama tampilnya didefinisikan di
`src/lib/birdep.ts` (`BIRDEP`); BPH sengaja tidak ikut.

Alur:

```
Client (NIM)
  → POST /api/check (src/app/api/check/route.ts)
    → findParticipantByNim() (src/lib/sheets.ts, "server-only")
      → htmlview → map nama tab → gid
      → CSV export raw per gid (fetch paralel via Promise.all)
      → header dideteksi by nama kolom (bukan posisi tetap — tidak semua
        tab punya layout kolom yang sama)
  ← { found: true, nama, nim, hasil, divisi } | { found: false }
```

Client **tidak pernah** menerima dataset penuh — hanya baris yang cocok
atau `{found:false}`.

### Keputusan: akses tanpa Google Cloud API key/billing

Spreadsheet di-share sebagai **"Anyone with the link: Viewer"**, dibaca via
endpoint publik milik Google Sheets sendiri — bukan Sheets API v4 resmi.
Ini butuh tidak ada Cloud Console / API key / billing.

Tab dibaca **by gid lewat raw CSV export** (`/export?format=csv&gid=`),
bukan `gviz/tq?sheet={nama}`: gviz diam-diam menjawab tab pertama untuk
nama tab yang tak dikenal, dan mengosongkan sel yang tipenya tak cocok
dengan tipe kolom yang ditebaknya. Karena export butuh gid, map nama tab →
gid dibaca dulu dari halaman `/htmlview` spreadsheet.

Trade-off yang sudah disetujui:

- ✅ Zero setup — tidak ada Cloud Console, API key, atau billing.
- ✅ Lookup tetap 100% server-side; client hanya terima
  `{found, nama, nim, hasil, divisi}`.
- ⚠️ Endpoint tidak resmi/tidak didokumentasikan Google (tanpa SLA, bisa
  berubah tanpa notice).
- ⚠️ Karena mode sharing "Anyone with the link", siapa pun yang memegang
  link share bisa membuka seluruh isi spreadsheet langsung — kondisi yang
  memang sudah ada sejak lama, bukan exposure baru dari aplikasi.

`GOOGLE_SHEETS_ID` diisi di `.env.local` (lihat `.env.local.example`).

### Klasifikasi hasil

Nilai kolom `Hasil` yang dipahami: `LOLOS` / `TIDAK LOLOS`, plus sentinel
`BELUM TERSEDIA` (pendaftar ditemukan tapi hasil belum diumumkan → state
`pending`, tanpa pill hasil & tanpa CTA WhatsApp). Nilai lain jatuh ke
state `lainnya`. Logika ada di `classifyHasil()` (`AcceptancePortal.tsx`)
dan harus sinkron dengan `PENDING_HASIL` (`src/lib/sheets.ts`).

Koreksi manual per-baris (`RESULT_OVERRIDES` di `sheets.ts`, keyed by
Birdep tab + nama) dipakai kalau hasil di sheet perlu diperbaiki lebih
cepat daripada mengedit sheet-nya — saat ini kosong.

---

# Design Language (brand Sekolah Ormawa)

Token warna/font disalin dari situs induk `sekolah-ormawa`
(`src/app/globals.css`): Royal Blue sebagai benang utama, Bright Yellow
khusus untuk elemen CTA / momen "kamu lolos". Diedarkan sebagai warna
Tailwind (`bg-royal`, `text-ink`, `bg-yellow`, …). Tidak ada web font —
menggunakan font sistem yang sama dengan situs induk.

`ResultReveal` menampilkan nama Birdep (via `getBirdepName`) dan — khusus
status LOLOS — blok kontak Kadiv + tombol "Chat WhatsApp" ke `wa.me/{nomor}`
dengan pesan otomatis. Kontak setiap Birdep ada di `src/lib/kadiv.ts`.

---

# QA (manual)

- ✅ Alur lengkap form → checking → result diuji (LOLOS / TIDAK LOLOS /
  not-found / validasi NIM client-side / NIM case-insensitive).
- ✅ Responsive: diuji tanpa horizontal overflow di range mobile–desktop.
- ✅ `tsc --noEmit`, `eslint`, `next build` bersih.

Belum ada automated test — QA sejauh ini manual.

---

# Known Issues / Next Steps

- Spreadsheet harus tetap share "Anyone with the link: Viewer" — kalau
  diubah ke Restricted, lookup gagal (500).
- Belum deploy.
- Belum ada automated test.

---

# Development Philosophy

Readable, maintainable, tidak over-engineer. Tidak ada database baru,
tidak ada auth, tidak ada admin dashboard — Google Sheets sebagai
satu-satunya source of truth.