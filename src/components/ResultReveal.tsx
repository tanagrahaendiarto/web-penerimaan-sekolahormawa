"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { buttonHover, fadeInUp, hoverTransition, revealFromBlur, staggerContainer } from "@/lib/motion";
import { getBirdepName } from "@/lib/birdep";
import { buildKadivWhatsAppUrl, getKadivContact } from "@/lib/kadiv";

export type ResultStatus = "lolos" | "tidak-lolos" | "lainnya" | "pending";

type ResultCopy = {
  eyebrow: string;
  headline: ReactNode;
  supporting: string;
  pillClassName: string;
  glowClassName: string;
};

const COPY: Record<ResultStatus, ResultCopy> = {
  lolos: {
    eyebrow: "Hasil Seleksi",
    headline: (
      <>
        Selamat <mark className="hl bg-transparent text-inherit">Bergabung</mark>.
      </>
    ),
    supporting: "Temukan peranmu dan bertumbuh bersama di Sekolah Ormawa.",
    pillClassName: "bg-yellow text-ink",
    glowClassName:
      "bg-[radial-gradient(ellipse_60%_50%_at_50%_35%,rgba(244,225,27,0.28),transparent_70%)]",
  },
  "tidak-lolos": {
    eyebrow: "Hasil Seleksi",
    headline: "Terima Kasih Sudah Melangkah.",
    supporting: "Kali ini belum menjadi giliranmu, tapi semangatmu untuk berkontribusi tetap berarti.",
    pillClassName: "border border-line-strong bg-paper text-ink-soft",
    glowClassName:
      "bg-[radial-gradient(ellipse_60%_50%_at_50%_35%,rgba(0,53,173,0.1),transparent_70%)]",
  },
  lainnya: {
    eyebrow: "Hasil Seleksi",
    headline: "Hasil Kamu Sudah Tersedia.",
    supporting: "Hubungi panitia apabila kamu memiliki pertanyaan lebih lanjut.",
    pillClassName: "border border-line-strong bg-paper text-ink-soft",
    glowClassName: "",
  },
  pending: {
    eyebrow: "Hasil Seleksi",
    headline: "Informasi hasil seleksi kamu belum tersedia.",
    supporting: "Coba cek kembali dalam waktu dekat.",
    pillClassName: "",
    glowClassName: "",
  },
};

type ResultRevealProps = {
  status: ResultStatus;
  nama: string;
  nim: string;
  hasilLabel: string;
  divisi: string;
  onReset: () => void;
};

export default function ResultReveal({ status, nama, nim, hasilLabel, divisi, onReset }: ResultRevealProps) {
  const copy = COPY[status];
  const kadiv = status === "lolos" ? getKadivContact(divisi) : undefined;

  return (
    <motion.div
      className="relative w-full max-w-md"
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}
      variants={staggerContainer(0.16)}
    >
      {copy.glowClassName && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -inset-x-2 -inset-y-6 -z-10 sm:-inset-x-10 sm:-inset-y-16 ${copy.glowClassName}`}
        />
      )}

      <motion.div
        variants={revealFromBlur}
        className="overflow-hidden rounded-2xl border border-line bg-paper-light text-center shadow-soft"
      >
        <div aria-hidden="true" className="h-1.5 bg-[linear-gradient(90deg,#0035ad,#307fe2,#f4e11b)]" />

        <div className="px-6 py-10 sm:px-10 sm:py-12">
          <motion.p variants={fadeInUp} className="text-[10px] font-black uppercase tracking-[0.22em] text-royal">
            {copy.eyebrow}
          </motion.p>

          <motion.h1
            variants={fadeInUp}
            className="mt-4 text-3xl leading-tight tracking-[-0.04em] text-ink sm:text-4xl"
          >
            {copy.headline}
          </motion.h1>

          <motion.div variants={fadeInUp} className="mt-8 space-y-1">
            <p className="text-lg font-bold text-ink sm:text-xl">{nama}</p>
            <p className="text-sm tracking-[0.1em] text-ink-soft">{nim}</p>
            <p className="pt-2 text-sm font-semibold text-royal">{getBirdepName(divisi)}</p>
          </motion.div>

          {status !== "pending" && (
            <motion.div variants={fadeInUp} className="mt-6 flex justify-center">
              <span
                className={`inline-flex items-center rounded-full px-6 py-2 text-sm font-black uppercase tracking-[0.2em] ${copy.pillClassName}`}
              >
                {hasilLabel}
              </span>
            </motion.div>
          )}

          <motion.p variants={fadeInUp} className="mx-auto mt-6 max-w-xs text-sm leading-6 text-ink-soft">
            {copy.supporting}
          </motion.p>

          {kadiv && (
            <motion.div variants={fadeInUp} className="mt-8 border-t border-line pt-8">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-royal">
                Hubungi Kadiv {divisi}
              </p>
              <p className="mt-2 text-base font-bold text-ink">{kadiv.nama}</p>

              <motion.a
                href={buildKadivWhatsAppUrl(kadiv.nama, kadiv.whatsapp, nama, nim)}
                target="_blank"
                rel="noopener noreferrer"
                {...buttonHover}
                className="mt-5 inline-flex items-center justify-center rounded-full bg-yellow px-8 py-3 text-sm font-extrabold uppercase tracking-[0.15em] text-ink transition-[background-color,box-shadow] duration-300 hover:bg-sun hover:shadow-[0_14px_30px_rgba(242,169,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal-dark focus-visible:ring-offset-4 focus-visible:ring-offset-paper-light"
              >
                Chat WhatsApp
              </motion.a>
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} className="mt-6 flex justify-center">
        <motion.button
          type="button"
          onClick={onReset}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={hoverTransition}
          className="inline-flex items-center rounded-full border border-royal px-6 py-3 text-sm font-bold text-royal transition-colors duration-300 hover:bg-royal hover:text-paper-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
        >
          Cek NIM Lain
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
