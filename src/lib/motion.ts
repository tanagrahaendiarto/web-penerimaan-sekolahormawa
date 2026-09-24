import type { Transition, Variants } from "motion/react";

// Single shared easing curve + durations — reused everywhere so every
// animation on the page moves with the same "premium" feel.
export const EASE = [0.16, 1, 0.3, 1] as const;

export const DURATION = {
  reveal: 0.6,
  resultReveal: 0.7,
  hover: 0.3,
  checking: 1100, // ms — the verification beat before a result is shown
} as const;

export const revealTransition: Transition = {
  duration: DURATION.reveal,
  ease: EASE,
};

export const hoverTransition: Transition = {
  duration: DURATION.hover,
  ease: EASE,
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: revealTransition },
};

// The reveal moment itself: starts soft/out-of-focus and resolves into
// place, so the result reads as something coming into clarity rather than
// just sliding in.
export const revealFromBlur: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.98, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: DURATION.resultReveal, ease: EASE },
  },
};

// Staggered entrance for a group of elements (Nama / NIM / Status revealing
// one after another rather than all at once).
export const staggerContainer = (staggerChildren = 0.14): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren: 0.05 } },
});

// Shared hover/tap affordance for the CTA button.
export const buttonHover = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.97 },
  transition: hoverTransition,
} as const;

// Gentle "check again" nudge for the not-found state — a cue, not a
// punishment, so it stays short and low-amplitude.
export const gentleShake = {
  x: [0, -6, 6, -4, 4, 0],
  transition: { duration: 0.4, ease: EASE },
};

// Very slow breathing scale for the background logo watermark — meant to be
// felt more than seen.
export const logoBreathe = {
  animate: { scale: [1, 1.02, 1] },
  transition: { duration: 22, repeat: Infinity, ease: "easeInOut" as const },
};
