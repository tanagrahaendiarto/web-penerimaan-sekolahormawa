"use client";

import { motion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { buttonHover, fadeInUp, revealFromBlur, stampSlam, staggerContainer, vibrate } from "@/lib/motion";
import { getBirdepName } from "@/lib/birdep";
import { buildKadivWhatsAppUrl, getKadivContact } from "@/lib/kadiv";
import Confetti from "@/components/Confetti";

export type ResultStatus = "lolos" | "tidak-lolos" | "lainnya" | "pending";

type ResultCopy = {
  eyebrow: string;
  headline: ReactNode;
  supporting: string;
  cardClassName: string;
  stampClassName: string;
};

const COPY: Record<ResultStatus, ResultCopy> = {
  lolos: {
    eyebrow: "Selamat!",
    headline: (
      <>
        Kamu <mark className="hl hl-dark">Lolos</mark> Seleksi
      </>
    ),
    supporting: "Selamat bergabung! Temukan peranmu dan bertumbuh bersama di Sekolah Ormawa PKU.",
    cardClassName: "border-yellow/50 shadow-[0_30px_100px_-20px_rgba(244,225,27,0.45)]",
    stampClassName: "border-yellow bg-yellow text-ink shadow-[0_10px_40px_rgba(244,225,27,0.5)]",
  },
  "tidak-lolos": {
    eyebrow: "Hasil Seleksi",
    headline: "Terima Kasih Sudah Melangkah",
    supporting:
      "Kali ini belum menjadi giliranmu. Keberanianmu untuk mencoba sudah jadi langkah besar, dan semangatmu untuk berkontribusi tetap berarti.",
    cardClassName: "",
    stampClassName: "border-mist-soft text-mist",
  },
  lainnya: {
    eyebrow: "Hasil Seleksi",
    headline: "Hasil Kamu Sudah Tersedia",
    supporting: "Hubungi panitia apabila kamu memiliki pertanyaan lebih lanjut.",
    cardClassName: "",
    stampClassName: "border-sky-soft text-sky-soft",
  },
  pending: {
    eyebrow: "Hasil Seleksi",
    headline: "Hasilmu Belum Tersedia",
    supporting: "Hasil seleksi untuk Birdep kamu belum diumumkan. Coba cek kembali dalam waktu dekat, ya.",
    cardClassName: "",
    stampClassName: "",
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
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    if (status === "lolos") vibrate([60, 40, 120]);
  }, [status]);

  return (
    <>
      {status === "lolos" && (
        <>
          <Confetti />
          {/* Camera-flash at the moment of reveal. */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-40 bg-white"
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </>
      )}

      <motion.section
        aria-labelledby="result-title"
        className="relative w-full max-w-md"
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, y: -12, transition: { duration: 0.25 } }}
        variants={staggerContainer(0.12, status === "lolos" ? 0.45 : 0.1)}
      >
        <motion.div
          variants={revealFromBlur}
          className={`glass relative rounded-[1.75rem] text-center ${copy.cardClassName}`}
        >
          <div
            aria-hidden="true"
            className="h-1.5 rounded-t-[1.75rem] bg-[linear-gradient(90deg,#0035ad,#307fe2,#f4e11b)]"
          />

          <div className="px-5 pt-9 pb-8 sm:px-10 sm:pt-11 sm:pb-10">
            <motion.p
              variants={fadeInUp}
              className={`eyebrow ${status === "lolos" ? "text-yellow" : "text-sky-soft"}`}
            >
              {copy.eyebrow}
            </motion.p>

            <motion.h1
              id="result-title"
              ref={headingRef}
              tabIndex={-1}
              variants={fadeInUp}
              className="mt-4 text-[2rem] leading-[1.1] font-extrabold tracking-[-0.035em] outline-none sm:text-[2.6rem]"
            >
              {copy.headline}
            </motion.h1>

            {status !== "pending" ? (
              <motion.div variants={stampSlam} className="mt-7 flex justify-center">
                <span
                  className={`inline-flex items-center gap-2 rounded-xl border-[3px] px-6 py-2.5 text-lg font-extrabold tracking-[0.2em] uppercase sm:text-xl ${copy.stampClassName}`}
                >
                  {status === "lolos" && (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="size-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  )}
                  {hasilLabel}
                </span>
              </motion.div>
            ) : (
              <motion.div variants={fadeInUp} className="mt-7 flex justify-center">
                <span className="grid size-16 place-items-center rounded-full border border-line-strong text-sky-soft">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="size-8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </span>
              </motion.div>
            )}

            <motion.dl
              variants={fadeInUp}
              className="mt-8 divide-y divide-line rounded-2xl border border-line bg-night/40 text-left text-sm"
            >
              <div className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <dt className="text-mist-soft">Nama</dt>
                <dd className="font-bold break-words sm:text-right">{nama || "—"}</dd>
              </div>
              <div className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <dt className="text-mist-soft">NIM</dt>
                <dd className="font-bold tracking-[0.08em] break-all sm:text-right">{nim}</dd>
              </div>
              <div className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <dt className="text-mist-soft">Birdep</dt>
                <dd className="font-bold text-sky-soft sm:text-right">{getBirdepName(divisi)}</dd>
              </div>
            </motion.dl>

            <motion.p variants={fadeInUp} className="mx-auto mt-6 max-w-sm text-[0.95rem] leading-7 text-mist">
              {copy.supporting}
            </motion.p>

            {kadiv && (
              <motion.div
                variants={fadeInUp}
                className="mt-8 rounded-2xl border border-yellow/25 bg-yellow/[0.06] p-5 text-left"
              >
                <p className="eyebrow text-yellow">Langkah Selanjutnya</p>
                <p className="mt-2 text-sm leading-6 text-mist">
                  Hubungi Kadiv {divisi} untuk informasi berikutnya:
                </p>
                <p className="mt-1 text-base font-bold">{kadiv.nama}</p>

                <motion.a
                  href={buildKadivWhatsAppUrl(kadiv.nama, kadiv.whatsapp, nama, nim)}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...buttonHover}
                  className="btn-primary mt-4 w-full"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="currentColor">
                    <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.98L2 22l5.16-1.5A9.92 9.92 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.06.89.9-2.98-.2-.31a8.18 8.18 0 1 1 6.84 3.73Zm4.49-6.12c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.78.97-.15.16-.29.18-.54.06a6.7 6.7 0 0 1-3.34-2.92c-.25-.43.25-.4.72-1.34.08-.16.04-.3-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.41-.56-.42h-.48a.92.92 0 0 0-.67.31 2.8 2.8 0 0 0-.87 2.08 4.86 4.86 0 0 0 1.02 2.58 11.1 11.1 0 0 0 4.25 3.76c1.6.69 2.22.75 3.02.63.49-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
                  </svg>
                  Chat WhatsApp Kadiv
                </motion.a>
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="mt-6 flex justify-center">
          <motion.button type="button" onClick={onReset} {...buttonHover} className="btn-ghost">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            Cek NIM Lain
          </motion.button>
        </motion.div>
      </motion.section>
    </>
  );
}
