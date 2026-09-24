// The 17 active Birdep of Sekolah Ormawa PKU, copied from the parent site's
// department fixtures (sekolah-ormawa/prisma/seed.ts). `tab` is the exact
// spreadsheet tab name each Birdep's results live in — it's the Birdep's
// short name, so tabs stay readable for the committee editing the sheet.
// BPH is intentionally absent: it doesn't recruit through Sekolah Ormawa.
export const BIRDEP = [
  // Eksekutif
  { tab: "Internal", name: "Biro Internal" },
  { tab: "Medbrand", name: "Biro Media Branding" },
  { tab: "Ristek", name: "Biro Riset dan Teknologi" },
  { tab: "Komit", name: "Biro Kolaborasi dan Kemitraan" },
  { tab: "Adkesmah", name: "Departemen Advokasi dan Kesejahteraan Mahasiswa" },
  { tab: "Akpres", name: "Departemen Akademik dan Prestasi" },
  { tab: "Kastrat", name: "Departemen Kajian dan Aksi Strategis" },
  { tab: "Peraga", name: "Departemen Pemuda dan Olahraga" },
  { tab: "PSDM", name: "Departemen Pengembangan Sumber Daya Mahasiswa" },
  { tab: "Senbud", name: "Departemen Seni dan Budaya" },
  { tab: "SLH", name: "Departemen Sosial dan Lingkungan Hidup" },
  { tab: "Ekraf", name: "Departemen Ekonomi Kreatif" },
  // Legislatif
  { tab: "Komleg", name: "Komisi Legislasi" },
  { tab: "Komanggar", name: "Komisi Anggaran" },
  { tab: "Kompeng", name: "Komisi Pengawasan" },
  { tab: "Badintekst", name: "Badan Internal dan Eksternal" },
  { tab: "Badmedbrnd", name: "Badan Media dan Branding" },
] as const;

export function getBirdepName(tab: string) {
  return BIRDEP.find((birdep) => birdep.tab === tab)?.name ?? tab;
}
