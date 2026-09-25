"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useEffect, useRef, type FormEvent } from "react";
import { buttonHover, fadeInUp, gentleShake, staggerContainer } from "@/lib/motion";

export type FormErrorKind = "invalid" | "not-found" | "server-error";

const ERROR_MESSAGES: Record<FormErrorKind, { title: string; hint: string }> = {
  invalid: {
    title: "Format NIM belum sesuai.",
    hint: "NIM berisi 6–20 huruf/angka tanpa spasi, contoh: H2401261021.",
  },
  "not-found": {
    title: "NIM tidak ditemukan.",
    hint: "Periksa kembali NIM yang kamu masukkan, pastikan sama dengan saat mendaftar.",
  },
  "server-error": {
    title: "Terjadi kendala saat memeriksa data.",
    hint: "Periksa koneksi internet kamu, lalu coba lagi dalam beberapa saat.",
  },
};

type NimEntryScreenProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  error: FormErrorKind | null;
  shakeKey: number;
  autoFocus: boolean;
};

export default function NimEntryScreen({ value, onChange, onSubmit, error, shakeKey, autoFocus }: NimEntryScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Only when coming back from a result ("Cek NIM Lain") — focusing on
  // first load would pop the keyboard over the headline on phones.
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Keep focus in the field after a failed check so the user can fix it.
  useEffect(() => {
    if (error && error !== "server-error") inputRef.current?.focus();
  }, [error, shakeKey]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <motion.section
      aria-labelledby="entry-title"
      className="w-full max-w-md"
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -16, filter: "blur(6px)", transition: { duration: 0.3 } }}
      variants={staggerContainer(0.1)}
    >
      <motion.div variants={fadeInUp} className="flex justify-center">
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 scale-150 rounded-full bg-[radial-gradient(circle,rgba(244,225,27,0.3),transparent_65%)]"
          />
          <Image
            src="/logo-so.png"
            alt="Sekolah Ormawa PKU"
            width={88}
            height={70}
            priority
            className="h-auto w-[72px] sm:w-[88px]"
          />
        </div>
      </motion.div>

      <motion.p variants={fadeInUp} className="eyebrow mt-6 text-center text-sky-soft">
        Pengumuman Seleksi · Sekolah Ormawa PKU 2026
      </motion.p>

      <motion.h1
        id="entry-title"
        variants={fadeInUp}
        className="mt-4 text-center text-[2.5rem] leading-[1.02] font-extrabold tracking-[-0.04em] sm:text-6xl"
      >
        Saatnya Melihat <mark className="hl hl-dark">Hasilmu</mark>
      </motion.h1>

      <motion.p
        variants={fadeInUp}
        className="mx-auto mt-5 max-w-sm text-center text-[0.95rem] leading-7 text-mist sm:text-base"
      >
        Perjalananmu sampai di sini. Masukkan NIM kamu dan temukan jawabannya.
      </motion.p>

      <motion.form
        variants={fadeInUp}
        onSubmit={handleSubmit}
        className="glass mt-9 rounded-[1.75rem] p-4 sm:mt-10 sm:p-5"
        noValidate
      >
        <label htmlFor="nim" className="eyebrow mb-3 block px-2 text-left text-mist-soft">
          Nomor Induk Mahasiswa
        </label>

        {/* Independent leaf element so the shake keyframe (re-triggered by
            remounting on shakeKey) never fights the entrance variants
            propagated from the container above. */}
        <motion.div key={shakeKey} animate={error && error !== "server-error" ? gentleShake : undefined}>
          <div className="relative">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-mist-soft"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="9" cy="10" r="2" />
              <path d="M15 8h2M15 12h2M7 16h10" />
            </svg>
            <input
              ref={inputRef}
              id="nim"
              name="nim"
              type="text"
              inputMode="text"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={20}
              placeholder="Contoh: H2401261021"
              value={value}
              onChange={(event) => onChange(event.target.value.replace(/\s+/g, "").toUpperCase())}
              aria-invalid={error !== null && error !== "server-error"}
              aria-describedby={error ? "nim-error" : "nim-hint"}
              className={`h-15 w-full rounded-2xl border bg-night/60 pr-4 pl-13 text-lg font-bold tracking-[0.12em] text-paper-light outline-none transition-[box-shadow,border-color] duration-300 placeholder:font-medium placeholder:tracking-normal placeholder:text-mist-soft/70 focus:shadow-[0_0_0_4px_rgba(143,184,255,0.25)] sm:text-xl ${
                error && error !== "server-error"
                  ? "border-danger focus:border-danger"
                  : "border-line-strong focus:border-sky-soft"
              }`}
            />
          </div>

          <motion.button type="submit" {...buttonHover} className="btn-primary mt-3 w-full">
            Cek Hasil
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
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </motion.button>
        </motion.div>

        <div aria-live="polite" className="min-h-6 px-2 pt-3 text-left">
          {error ? (
            <motion.p
              id="nim-error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2.5 rounded-xl bg-danger/10 p-3 text-sm leading-6"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 size-5 shrink-0 text-danger" fill="currentColor">
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z" />
              </svg>
              <span>
                <span className="block font-bold text-danger">{ERROR_MESSAGES[error].title}</span>
                <span className="text-mist">{ERROR_MESSAGES[error].hint}</span>
              </span>
            </motion.p>
          ) : (
            <p id="nim-hint" className="text-xs leading-5 text-mist-soft">
              Huruf besar/kecil tidak berpengaruh. Data kamu hanya dipakai untuk mencari hasil.
            </p>
          )}
        </div>
      </motion.form>
    </motion.section>
  );
}
