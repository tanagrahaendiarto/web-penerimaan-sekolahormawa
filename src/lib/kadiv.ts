// Keyed by the exact Birdep tab name in src/lib/birdep.ts (BIRDEP[].tab) so
// a lookup from the API's `divisi` field is a direct hit. `whatsapp` is the
// international format without a leading + (628xxxxxxxxxx) — rendered as-is
// into a wa.me link on the LOLOS result.
const KADIV: Record<string, { nama: string; whatsapp: string }> = {
  Komit: { nama: "Irfan Maulana", whatsapp: "6281382713383" },
  Internal: { nama: "Nina Salamah", whatsapp: "6281347418571" },
  Medbrand: { nama: "Riyadh", whatsapp: "6285864187435" },
  Ristek: { nama: "Muhammad Syauqi", whatsapp: "62895360824654" },
  Adkesmah: { nama: "Farrel Zhillan Kahfi", whatsapp: "62895636071377" },
  Akpres: { nama: "Alma Nurkamila", whatsapp: "6287852550672" },
  Kastrat: { nama: "Sasikirana Cantika", whatsapp: "6283100529494" },
  Peraga: { nama: "Naufal Adika Hutama Putra", whatsapp: "6281328577255" },
  PSDM: { nama: "Li Chiang", whatsapp: "6288211352870" },
  Senbud: { nama: "Dandy Farel Kenedy", whatsapp: "6285998035220" },
  SLH: { nama: "Dewo Febriansyah", whatsapp: "6282299086727" },
  Ekraf: { nama: "Fany Veronika", whatsapp: "6281290734832" },
  Komleg: { nama: "Nurul Azkiya Rahmah", whatsapp: "62882002887333" },
  Komanggar: { nama: "Aleeya Mafaaza Kamila", whatsapp: "6285932272709" },
  Kompeng: { nama: "Muhammad Ravadio", whatsapp: "6281382329132" },
  Badintekst: { nama: "Fawwaz Fikri", whatsapp: "6287788770473" },
  Badmedbrnd: { nama: "Erlang", whatsapp: "6283825732737" },
};

export function getKadivContact(divisi: string) {
  const kadiv = KADIV[divisi];
  return kadiv?.nama && kadiv.whatsapp ? kadiv : undefined;
}

export function buildKadivWhatsAppUrl(kadivNama: string, whatsapp: string, pesertaNama: string, nim: string) {
  const message = `Halo Kak ${kadivNama}, saya ${pesertaNama} dengan NIM ${nim}. Saya dinyatakan LOLOS seleksi Sekolah Ormawa PKU 2026 dan ingin menanyakan informasi selanjutnya. Terima kasih, Kak.`;
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
}
