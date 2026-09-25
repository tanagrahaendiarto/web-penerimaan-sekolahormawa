"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { DURATION, fadeInUp, staggerContainer } from "@/lib/motion";
import { BIRDEP } from "@/lib/birdep";

const STEPS = [
  "Menghubungkan ke server",
  `Menelusuri data ${BIRDEP.length} Birdep`,
  "Mencocokkan NIM kamu",
  "Menyiapkan hasil",
];

// Search beat between submit and the sealed result. The steps are paced to
// the minimum checking duration (the real lookup usually finishes sooner),
// so the last step is still "in progress" when the screen hands off.
export default function CheckingState({ nim }: { nim: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setStep((current) => Math.min(current + 1, STEPS.length - 1)),
      DURATION.checking / STEPS.length,
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.section
      aria-label="Memeriksa hasil seleksi"
      className="flex w-full max-w-sm flex-col items-center"
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.3 } }}
      variants={staggerContainer(0.1)}
    >
      <motion.div variants={fadeInUp} className="relative grid size-44 place-items-center sm:size-52">
        {/* Radar sweep */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(143,184,255,0.55)_60deg,transparent_62deg)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
        />
        <div aria-hidden="true" className="absolute inset-0 rounded-full border border-line-strong" />
        <div aria-hidden="true" className="absolute inset-[18%] rounded-full border border-line" />
        <div aria-hidden="true" className="absolute inset-[36%] rounded-full border border-line" />
        {[0, 1].map((ring) => (
          <motion.div
            key={ring}
            aria-hidden="true"
            className="absolute inset-[30%] rounded-full border-2 border-sky-soft/60"
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 2.6, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, delay: ring, ease: "easeOut" }}
          />
        ))}
        <div className="relative grid size-20 place-items-center rounded-full bg-night shadow-[0_0_40px_rgba(48,127,226,0.5)] ring-1 ring-line-strong sm:size-24">
          <Image src="/logo-so.png" alt="" width={56} height={45} className="h-auto w-12 sm:w-14" />
        </div>
      </motion.div>

      <motion.p variants={fadeInUp} className="eyebrow mt-8 text-sky-soft">
        Mencari hasil untuk
      </motion.p>
      <motion.p variants={fadeInUp} className="mt-2 text-2xl font-extrabold tracking-[0.12em] break-all">
        {nim}
      </motion.p>

      <motion.ol variants={fadeInUp} className="glass mt-7 w-full space-y-3 rounded-2xl p-5 text-left text-sm">
        {STEPS.map((label, index) => {
          const done = index < step;
          const active = index === step;
          return (
            <li
              key={label}
              className={`flex items-center gap-3 transition-colors duration-500 ${
                done ? "text-mist" : active ? "text-paper-light" : "text-mist-soft/50"
              }`}
            >
              <span className="grid size-5 shrink-0 place-items-center">
                {done ? (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    viewBox="0 0 24 24"
                    className="size-5 text-yellow"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </motion.svg>
                ) : active ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-sky-soft border-t-transparent" />
                ) : (
                  <span className="size-1.5 rounded-full bg-current" />
                )}
              </span>
              <span className={active ? "font-semibold" : ""}>{label}</span>
            </li>
          );
        })}
      </motion.ol>
    </motion.section>
  );
}
