"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { DURATION, vibrate } from "@/lib/motion";

const TICKS = [
  { value: 3, caption: "Tarik napas…" },
  { value: 2, caption: "Deg… deg…" },
  { value: 1, caption: "Ini dia…" },
];

// 3·2·1 right before the reveal. Each tick lands with a heartbeat pulse
// (and a haptic tap on phones that support it).
export default function Countdown({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  // Held in a ref so a parent re-render (new callback identity) can't
  // restart the running tick.
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    vibrate(25);
    const timeout = setTimeout(() => {
      if (index < TICKS.length - 1) setIndex(index + 1);
      else onDoneRef.current();
    }, DURATION.countdownStep);
    return () => clearTimeout(timeout);
  }, [index]);

  const tick = TICKS[index];

  return (
    <motion.section
      aria-label="Membuka hasil"
      className="flex w-full flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.4, filter: "blur(12px)", transition: { duration: 0.35 } }}
    >
      <div className="relative grid size-56 place-items-center sm:size-64">
        <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(195,209,240,0.14)" strokeWidth="2" />
          <motion.circle
            key={index}
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#f4e11b"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 1 }}
            animate={{ pathLength: 0 }}
            transition={{ duration: DURATION.countdownStep / 1000, ease: "linear" }}
          />
        </svg>

        <motion.div
          key={`pulse-${index}`}
          aria-hidden="true"
          className="absolute inset-6 rounded-full bg-[radial-gradient(circle,rgba(244,225,27,0.35),transparent_70%)]"
          initial={{ scale: 0.6, opacity: 1 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        <AnimatePresence mode="popLayout">
          <motion.span
            key={tick.value}
            className="text-[7rem] leading-none font-extrabold tabular-nums text-paper-light drop-shadow-[0_0_30px_rgba(244,225,27,0.45)] sm:text-[8.5rem]"
            initial={{ scale: 1.8, opacity: 0 }}
            animate={{ scale: [1.8, 0.92, 1.06, 1], opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.5, times: [0, 0.5, 0.75, 1] }}
          >
            {tick.value}
          </motion.span>
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={tick.caption}
          className="mt-8 text-lg font-semibold text-mist"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {tick.caption}
        </motion.p>
      </AnimatePresence>
    </motion.section>
  );
}
