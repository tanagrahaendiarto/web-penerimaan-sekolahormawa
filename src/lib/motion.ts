import type { Transition, Variants } from "motion/react";

// Single shared easing curve + durations — reused everywhere so every
// animation on the page moves with the same "premium" feel.
export const EASE = [0.16, 1, 0.3, 1] as const;

export const DURATION = {
  reveal: 0.6,
  resultReveal: 0.8,
  hover: 0.3,
  checking: 2800, // ms — minimum length of the "searching" beat
  countdownStep: 950, // ms — each tick of the 3·2·1 before the reveal
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
  hidden: { opacity: 0, y: 20, scale: 0.96, filter: "blur(10px)" },
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
export const staggerContainer = (staggerChildren = 0.14, delayChildren = 0.05): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
});

// The LOLOS stamp: drops in oversized and slams onto the card.
export const stampSlam: Variants = {
  hidden: { opacity: 0, scale: 2.6, rotate: -18 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: -4,
    transition: { type: "spring", stiffness: 520, damping: 22, mass: 1.1 },
  },
};

// Shared hover/tap affordance for buttons.
export const buttonHover = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.96 },
  transition: hoverTransition,
} as const;

// Gentle "check again" nudge for the not-found state — a cue, not a
// punishment, so it stays short and low-amplitude.
export const gentleShake = {
  x: [0, -8, 8, -5, 5, 0],
  transition: { duration: 0.42, ease: EASE },
};

// Double-beat "lub-dub" used on the sealed envelope and the countdown.
export const heartbeat = {
  animate: { scale: [1, 1.05, 1, 1.08, 1] },
  transition: { duration: 1.1, times: [0, 0.12, 0.26, 0.4, 1], repeat: Infinity, ease: "easeOut" as const },
};

// Very slow breathing scale for the background logo watermark — meant to be
// felt more than seen.
export const logoBreathe = {
  animate: { scale: [1, 1.03, 1] },
  transition: { duration: 18, repeat: Infinity, ease: "easeInOut" as const },
};

// Best-effort haptic tick on phones that support it (Android Chrome);
// silently a no-op elsewhere (iOS Safari, desktop).
export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Some browsers throw when called without a user gesture — ignore.
    }
  }
}
