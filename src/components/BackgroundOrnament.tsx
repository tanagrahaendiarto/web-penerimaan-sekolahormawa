"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { logoBreathe } from "@/lib/motion";

// Mood of the stage, driven by the portal's current screen:
// idle (form/checking) → tense (sealed/countdown, lights go down) →
// lolos (warm yellow spotlight) or calm (soft blue for every other result).
export type StageTone = "idle" | "tense" | "lolos" | "calm";

const layer = "absolute inset-0 transition-opacity duration-[1200ms] ease-out";

// Ambient stage: a deep navy base, radial "stage lights" layered as plain
// gradients (no CSS blur filters, so it stays cheap on low-end phones), a
// faint dot grid, and the SO emblem bleeding off the bottom-right corner.
// Kept at -z-10 / pointer-events-none so it never competes with content.
export default function BackgroundOrnament({ tone }: { tone: StageTone }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-night">
      <div
        className={`${layer} bg-[radial-gradient(ellipse_70%_55%_at_85%_0%,rgba(48,127,226,0.35),transparent_70%),radial-gradient(ellipse_60%_50%_at_0%_100%,rgba(0,53,173,0.55),transparent_70%),linear-gradient(180deg,#051437_0%,#020a1f_100%)]`}
        style={{ opacity: tone === "idle" ? 1 : 0.55 }}
      />

      <div
        className={`${layer} bg-[radial-gradient(ellipse_55%_45%_at_50%_42%,rgba(48,127,226,0.28),transparent_70%)]`}
        style={{ opacity: tone === "tense" ? 1 : 0 }}
      />

      <div
        className={`${layer} bg-[radial-gradient(ellipse_65%_55%_at_50%_0%,rgba(244,225,27,0.32),transparent_70%),radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(48,127,226,0.35),transparent_70%)]`}
        style={{ opacity: tone === "lolos" ? 1 : 0 }}
      />

      <div
        className={`${layer} bg-[radial-gradient(ellipse_60%_50%_at_50%_10%,rgba(143,184,255,0.2),transparent_70%)]`}
        style={{ opacity: tone === "calm" ? 1 : 0 }}
      />

      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(rgba(195,209,240,0.22) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 0%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 0%, transparent 80%)",
        }}
      />

      {/* Vignette that closes in while the result is still sealed. */}
      <div
        className={`${layer} bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.65)_100%)]`}
        style={{ opacity: tone === "tense" ? 1 : 0.35 }}
      />

      <motion.div
        className="absolute -bottom-[8vmin] -right-[8vmin] h-[44vmin] w-[44vmin] opacity-[0.07] sm:opacity-[0.09]"
        {...logoBreathe}
      >
        <Image src="/logo-so.png" alt="" fill sizes="44vmin" className="object-contain" />
      </motion.div>
    </div>
  );
}
