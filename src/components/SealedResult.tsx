"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { buttonHover, fadeInUp, heartbeat, staggerContainer } from "@/lib/motion";
import { getBirdepName } from "@/lib/birdep";

type SealedResultProps = {
  nama: string;
  nim: string;
  divisi: string;
  onOpen: () => void;
};

// The "it's in the envelope" beat: the participant is confirmed (name,
// NIM, Birdep) but the result stays sealed until they choose to open it.
export default function SealedResult({ nama, nim, divisi, onOpen }: SealedResultProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    buttonRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <motion.section
      aria-labelledby="sealed-title"
      className="flex w-full max-w-md flex-col items-center text-center"
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, scale: 0.94, filter: "blur(8px)", transition: { duration: 0.35 } }}
      variants={staggerContainer(0.14, 0.1)}
    >
      <motion.p variants={fadeInUp} className="eyebrow inline-flex items-center gap-2 text-yellow">
        <span className="size-2 animate-pulse rounded-full bg-yellow" />
        Hasil ditemukan
      </motion.p>

      <motion.h1
        id="sealed-title"
        variants={fadeInUp}
        className="mt-4 text-3xl leading-tight font-extrabold tracking-[-0.03em] break-words sm:text-4xl"
      >
        Halo, {nama || "Peserta"}
      </motion.h1>

      <motion.p variants={fadeInUp} className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm text-mist">
        <span className="rounded-full border border-line-strong px-3 py-1 font-semibold tracking-[0.1em]">{nim}</span>
        <span className="rounded-full border border-line-strong px-3 py-1 font-semibold">{getBirdepName(divisi)}</span>
      </motion.p>

      {/* Envelope */}
      <motion.div variants={fadeInUp} className="mt-10 w-full max-w-[20rem]">
        <motion.div {...heartbeat} className="relative mx-auto aspect-[4/3] w-full">
          <div className="absolute inset-0 overflow-hidden rounded-2xl bg-[linear-gradient(160deg,#0a3fb8,#00205b)] shadow-[0_30px_80px_-20px_rgba(48,127,226,0.7)] ring-1 ring-white/15">
            {/* Flap */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-[62%] bg-[linear-gradient(180deg,#1a55d6,#0a3fb8)]"
              style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
            />
            {/* Side folds */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.08),transparent_60%)]"
              style={{ clipPath: "polygon(0 100%, 50% 45%, 100% 100%)" }}
            />
            <p className="eyebrow absolute inset-x-0 bottom-4 text-[0.625rem] text-sky-soft/80">Rahasia · Hasil Seleksi</p>
          </div>
          {/* Wax seal */}
          <div className="absolute top-[62%] left-1/2 grid size-18 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff176,#f4e11b_45%,#f2a900)] shadow-[0_8px_24px_rgba(242,169,0,0.55),inset_0_-3px_6px_rgba(0,0,0,0.2)] ring-4 ring-yellow/30 sm:size-20">
            <Image src="/logo-so.png" alt="" width={48} height={38} className="h-auto w-10 drop-shadow sm:w-11" />
          </div>
        </motion.div>
      </motion.div>

      <motion.p variants={fadeInUp} className="mt-10 max-w-xs text-[0.95rem] leading-7 text-mist">
        Hasil seleksimu ada di dalam amplop ini. Tarik napas dulu… sudah siap?
      </motion.p>

      <motion.button
        ref={buttonRef}
        type="button"
        variants={fadeInUp}
        onClick={onOpen}
        {...buttonHover}
        className="btn-primary mt-6 w-full max-w-xs"
      >
        Buka Hasil
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 8l9 6 9-6M3 8v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8M3 8l9-5 9 5" />
        </svg>
      </motion.button>
    </motion.section>
  );
}
