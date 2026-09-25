"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#f4e11b", "#f2a900", "#ffffff", "#307fe2", "#8fb8ff", "#0035ad"];
const DURATION_MS = 5200;

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  spin: number;
  wobble: number;
  shape: "rect" | "circle";
};

// Dependency-free canvas confetti for the LOLOS moment: two cannons fire
// from the bottom corners, then a light shower falls from the top. Skipped
// entirely for users who prefer reduced motion.
export default function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const width = window.innerWidth;
    const height = window.innerHeight;
    // Fewer pieces on small screens keeps it smooth on budget phones.
    const perCannon = width < 640 ? 70 : 110;
    const pieces: Piece[] = [];
    const make = (x: number, y: number, vx: number, vy: number): Piece => ({
      x,
      y,
      vx,
      vy,
      size: 6 + Math.random() * 7,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.3,
      wobble: Math.random() * Math.PI * 2,
      shape: Math.random() < 0.7 ? "rect" : "circle",
    });

    const power = Math.max(height, 600) / 42;
    for (let i = 0; i < perCannon; i++) {
      const angle = (-60 - Math.random() * 25) * (Math.PI / 180);
      const speed = power * (0.6 + Math.random() * 0.6);
      pieces.push(make(0, height, Math.cos(angle) * speed, Math.sin(angle) * speed));
      pieces.push(make(width, height, -Math.cos(angle) * speed, Math.sin(angle) * speed));
    }
    const shower = setTimeout(() => {
      for (let i = 0; i < perCannon; i++) {
        pieces.push(make(Math.random() * width, -20 - Math.random() * 200, (Math.random() - 0.5) * 2, 2 + Math.random() * 2));
      }
    }, 600);

    const start = performance.now();
    let frame = 0;
    const draw = (now: number) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, width, height);
      const fade = elapsed > DURATION_MS - 1200 ? Math.max(0, (DURATION_MS - elapsed) / 1200) : 1;
      ctx.globalAlpha = fade;

      for (const p of pieces) {
        p.vy += 0.28;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.wobble += 0.1;
        p.x += p.vx + Math.sin(p.wobble) * 0.6;
        p.y += p.vy;
        p.rotation += p.spin;
        if (p.y > height + 40) continue;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2 * (0.6 + Math.abs(Math.sin(p.wobble)) * 0.8));
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (elapsed < DURATION_MS) frame = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, width, height);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(shower);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 h-full w-full" />;
}
