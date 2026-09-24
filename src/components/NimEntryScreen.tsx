"use client";

import Image from "next/image";
import { motion } from "motion/react";
import type { FormEvent } from "react";
import { buttonHover, fadeInUp, gentleShake, staggerContainer } from "@/lib/motion";

export type FormErrorKind = "invalid" | "not-found" | "server-error";

const ERROR_MESSAGES: Record<FormErrorKind, { title: string; hint: string }> = {
  invalid: {
    title: "Format NIM belum sesuai.",
    hint: "Periksa kembali NIM yang kamu masukkan.",
  },
  "not-found": {
    title: "NIM Tidak Ditemukan",
    hint: "Periksa kembali NIM yang kamu masukkan.",
  },
  "server-error": {
    title: "Terjadi kendala saat memeriksa data.",
    hint: "Coba lagi dalam beberapa saat.",
  },
};

type NimEntryScreenProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  error: FormErrorKind | null;
  shakeKey: number;
};

export default function NimEntryScreen({
  value,
  onChange,
  onSubmit,
  disabled,
  error,
  shakeKey,
}: NimEntryScreenProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <motion.div
      className="w-full max-w-md"
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      variants={staggerContainer()}
    >
      <motion.div variants={fadeInUp} className="flex justify-center">
        <Image src="/logo-so.png" alt="Sekolah Ormawa PKU" width={72} height={60} priority />
      </motion.div>

      <motion.p
        variants={fadeInUp}
        className="mt-6 text-center text-[10px] font-black uppercase tracking-[0.22em] text-royal"
      >
        Sekolah Ormawa PKU 2026
      </motion.p>

      <motion.h1
        variants={fadeInUp}
        className="mt-4 text-center text-4xl leading-none tracking-[-0.045em] text-ink sm:text-5xl"
      >
        Saatnya Melihat <mark className="hl bg-transparent text-inherit">Hasilmu</mark>
      </motion.h1>

      <motion.p
        variants={fadeInUp}
        className="mx-auto mt-5 max-w-xs text-center text-sm leading-6 text-ink-soft sm:text-base"
      >
        Masukkan NIM kamu untuk melihat hasil seleksi.
      </motion.p>

      <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="mt-10" noValidate>
        <label htmlFor="nim" className="sr-only">
          NIM
        </label>

        {/* Independent leaf element so the shake keyframe (re-triggered by
            remounting on shakeKey) never fights the entrance variants
            propagated from the container above. */}
        <motion.div key={shakeKey} animate={error ? gentleShake : undefined}>
          <input
            id="nim"
            name="nim"
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="characters"
            placeholder="Masukkan NIM kamu"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            aria-invalid={error !== null}
            aria-describedby={error ? "nim-error" : undefined}
            className="w-full rounded-full border border-line-strong bg-paper-light px-6 py-4 text-center text-lg tracking-wide text-ink shadow-soft placeholder:text-ink-soft/70 outline-none transition-[box-shadow,border-color] duration-300 focus:border-royal focus:shadow-[0_0_0_4px_rgba(0,53,173,0.14)] disabled:opacity-60"
          />

          <motion.button
            type="submit"
            disabled={disabled}
            {...buttonHover}
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-yellow px-8 py-4 text-sm font-extrabold uppercase tracking-[0.15em] text-ink transition-[background-color,box-shadow] duration-300 hover:bg-sun hover:shadow-[0_14px_30px_rgba(242,169,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal-dark focus-visible:ring-offset-4 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cek Hasil
          </motion.button>
        </motion.div>

        <div aria-live="polite" className="mt-4 min-h-10 text-center">
          {error && (
            <p id="nim-error" className="text-sm leading-6">
              <span className="font-semibold text-danger">
                {ERROR_MESSAGES[error].title}
              </span>
              <br />
              <span className="text-ink-soft">{ERROR_MESSAGES[error].hint}</span>
            </p>
          )}
        </div>
      </motion.form>
    </motion.div>
  );
}
