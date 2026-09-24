"use client";

import { motion } from "motion/react";
import { DURATION, fadeInUp } from "@/lib/motion";

export default function CheckingState() {
  return (
    <motion.div
      className="flex w-full max-w-xs flex-col items-center"
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      variants={fadeInUp}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-royal">
        Memverifikasi NIM
      </p>

      <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-line">
        <motion.div
          className="h-full w-full origin-left bg-[linear-gradient(90deg,#0035ad,#307fe2,#f4e11b)]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: DURATION.checking / 1000, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}
