"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { logoBreathe } from "@/lib/motion";

// Ambient background, same language as the parent site's `.public-site`:
// a paper gradient with two large low-opacity glows (yellow top-right,
// royal bottom-left), a faint grain, and the SO emblem bleeding off the
// bottom-right corner. Kept at -z-10 / pointer-events-none so it never
// competes with or intercepts the result.
export default function BackgroundOrnament() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[radial-gradient(circle_at_88%_4%,rgba(244,225,27,0.18),transparent_26rem),radial-gradient(circle_at_4%_96%,rgba(0,53,173,0.1),transparent_32rem),linear-gradient(180deg,#ffffff_0%,#f5f7fb_46%,#e7ecf7_100%)]"
    >
      <div
        className="absolute inset-0 opacity-[0.11]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.16'/%3E%3C/svg%3E\")",
        }}
      />

      <motion.div
        className="absolute -bottom-10 -right-10 h-[40vmin] w-[40vmin] opacity-[0.1] sm:h-[46vmin] sm:w-[46vmin] sm:opacity-[0.12]"
        style={{
          maskImage: "radial-gradient(circle at 100% 100%, black 0%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(circle at 100% 100%, black 0%, transparent 72%)",
        }}
        {...logoBreathe}
      >
        <Image
          src="/logo-so.png"
          alt=""
          fill
          sizes="(max-width: 640px) 40vmin, 46vmin"
          className="object-contain"
        />
      </motion.div>
    </div>
  );
}
