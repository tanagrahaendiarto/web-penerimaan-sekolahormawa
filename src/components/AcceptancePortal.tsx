"use client";

import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { DURATION } from "@/lib/motion";
import { isValidNim } from "@/lib/nim";
import NimEntryScreen, { type FormErrorKind } from "@/components/NimEntryScreen";
import CheckingState from "@/components/CheckingState";
import ResultReveal, { type ResultStatus } from "@/components/ResultReveal";

type CheckResponse =
  | { found: true; nama: string; nim: string; hasil: string; divisi: string }
  | { found: false; error?: string };

type ResultData = {
  status: ResultStatus;
  nama: string;
  nim: string;
  hasilLabel: string;
  divisi: string;
};

type Screen = "form" | "checking" | "result";

function classifyHasil(hasilRaw: string): ResultStatus {
  const normalized = hasilRaw.trim().toUpperCase();
  if (normalized === "LOLOS") return "lolos";
  if (normalized === "TIDAK LOLOS") return "tidak-lolos";
  // Must stay in sync with PENDING_HASIL in src/lib/sheets.ts.
  if (normalized === "BELUM TERSEDIA") return "pending";
  return "lainnya";
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function AcceptancePortal() {
  const [nim, setNim] = useState("");
  const [screen, setScreen] = useState<Screen>("form");
  const [formError, setFormError] = useState<FormErrorKind | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [result, setResult] = useState<ResultData | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const handleSubmit = async () => {
    if (!isValidNim(nim)) {
      setFormError("invalid");
      setShakeKey((key) => key + 1);
      return;
    }

    setFormError(null);
    setScreen("checking");
    setAnnouncement("Memverifikasi NIM.");

    const startedAt = Date.now();
    const settleChecking = async () => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, DURATION.checking - elapsed);
      if (remaining > 0) await wait(remaining);
    };

    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim }),
      });
      const data = (await response.json()) as CheckResponse;
      await settleChecking();

      if (data.found) {
        const status = classifyHasil(data.hasil);
        setResult({
          status,
          nama: data.nama,
          nim: data.nim,
          hasilLabel: data.hasil.trim() || "Tidak Tersedia",
          divisi: data.divisi,
        });
        setScreen("result");
        setAnnouncement(`Hasil ditemukan untuk ${data.nama}.`);
        return;
      }

      if (data.error === "lookup-failed") {
        setScreen("form");
        setFormError("server-error");
        setAnnouncement("Terjadi kendala saat memeriksa data.");
        return;
      }

      setScreen("form");
      setFormError("not-found");
      setShakeKey((key) => key + 1);
      setAnnouncement("NIM tidak ditemukan.");
    } catch {
      await settleChecking();
      setScreen("form");
      setFormError("server-error");
      setAnnouncement("Terjadi kendala saat memeriksa data.");
    }
  };

  const handleReset = () => {
    setScreen("form");
    setResult(null);
    setFormError(null);
    setNim("");
    setAnnouncement("");
  };

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-12 sm:px-8 sm:py-16">
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <AnimatePresence mode="wait">
        {screen === "form" && (
          <NimEntryScreen
            key="form"
            value={nim}
            onChange={(value) => {
              setNim(value);
              if (formError) setFormError(null);
            }}
            onSubmit={handleSubmit}
            disabled={false}
            error={formError}
            shakeKey={shakeKey}
          />
        )}

        {screen === "checking" && <CheckingState key="checking" />}

        {screen === "result" && result && (
          <ResultReveal
            key="result"
            status={result.status}
            nama={result.nama}
            nim={result.nim}
            hasilLabel={result.hasilLabel}
            divisi={result.divisi}
            onReset={handleReset}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
