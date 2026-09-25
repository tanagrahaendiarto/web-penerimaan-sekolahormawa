"use client";

import { AnimatePresence } from "motion/react";
import { useCallback, useState } from "react";
import { DURATION } from "@/lib/motion";
import { isValidNim, normalizeNim } from "@/lib/nim";
import NimEntryScreen, { type FormErrorKind } from "@/components/NimEntryScreen";
import CheckingState from "@/components/CheckingState";
import SealedResult from "@/components/SealedResult";
import Countdown from "@/components/Countdown";
import ResultReveal, { type ResultStatus } from "@/components/ResultReveal";
import BackgroundOrnament, { type StageTone } from "@/components/BackgroundOrnament";

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

// form → checking → sealed → countdown → result. A "pending" result skips
// the sealed/countdown ceremony since there's nothing to reveal yet.
type Screen = "form" | "checking" | "sealed" | "countdown" | "result";

function classifyHasil(hasilRaw: string): ResultStatus {
  const normalized = hasilRaw.trim().toUpperCase();
  if (normalized === "LOLOS") return "lolos";
  if (normalized === "TIDAK LOLOS") return "tidak-lolos";
  // Must stay in sync with PENDING_HASIL in src/lib/sheets.ts. An empty
  // cell means the committee hasn't filled the result in yet.
  if (normalized === "BELUM TERSEDIA" || normalized === "") return "pending";
  return "lainnya";
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stageTone(screen: Screen, result: ResultData | null): StageTone {
  if (screen === "sealed" || screen === "countdown") return "tense";
  if (screen === "result") return result?.status === "lolos" ? "lolos" : "calm";
  return "idle";
}

export default function AcceptancePortal() {
  const [nim, setNim] = useState("");
  const [screen, setScreen] = useState<Screen>("form");
  const [formError, setFormError] = useState<FormErrorKind | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [result, setResult] = useState<ResultData | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [returning, setReturning] = useState(false);

  const handleSubmit = async () => {
    if (!isValidNim(nim)) {
      setFormError("invalid");
      setShakeKey((key) => key + 1);
      return;
    }

    setFormError(null);
    setScreen("checking");
    setAnnouncement("Memeriksa NIM.");

    const startedAt = Date.now();
    const settleChecking = async () => {
      const remaining = Math.max(0, DURATION.checking - (Date.now() - startedAt));
      if (remaining > 0) await wait(remaining);
    };

    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim: normalizeNim(nim) }),
      });
      const data = (await response.json()) as CheckResponse;
      await settleChecking();

      if (data.found) {
        const status = classifyHasil(data.hasil);
        setResult({
          status,
          nama: data.nama,
          nim: data.nim,
          hasilLabel: data.hasil.trim(),
          divisi: data.divisi,
        });
        if (status === "pending") {
          setScreen("result");
          setAnnouncement("Hasil seleksi kamu belum tersedia.");
        } else {
          setScreen("sealed");
          setAnnouncement(`Hasil ditemukan untuk ${data.nama}. Tekan Buka Hasil untuk melihatnya.`);
        }
        return;
      }

      setScreen("form");
      if (data.error === "lookup-failed") {
        setFormError("server-error");
        setAnnouncement("Terjadi kendala saat memeriksa data.");
        return;
      }
      setFormError(data.error === "invalid-nim" ? "invalid" : "not-found");
      setShakeKey((key) => key + 1);
      setAnnouncement(data.error === "invalid-nim" ? "Format NIM belum sesuai." : "NIM tidak ditemukan.");
    } catch {
      await settleChecking();
      setScreen("form");
      setFormError("server-error");
      setAnnouncement("Terjadi kendala saat memeriksa data.");
    }
  };

  const handleCountdownDone = useCallback(() => {
    setScreen("result");
    setAnnouncement(
      result?.status === "lolos"
        ? "Selamat, kamu lolos seleksi!"
        : `Hasil seleksi: ${result?.hasilLabel ?? ""}.`,
    );
  }, [result]);

  const handleReset = () => {
    setScreen("form");
    setResult(null);
    setFormError(null);
    setNim("");
    setAnnouncement("");
    setReturning(true);
  };

  return (
    <>
      <BackgroundOrnament tone={stageTone(screen, result)} />

      <main className="relative flex min-h-dvh flex-col items-center justify-center px-4 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-8 sm:py-16">
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
              error={formError}
              shakeKey={shakeKey}
              autoFocus={returning}
            />
          )}

          {screen === "checking" && <CheckingState key="checking" nim={normalizeNim(nim)} />}

          {screen === "sealed" && result && (
            <SealedResult
              key="sealed"
              nama={result.nama}
              nim={result.nim}
              divisi={result.divisi}
              onOpen={() => setScreen("countdown")}
            />
          )}

          {screen === "countdown" && <Countdown key="countdown" onDone={handleCountdownDone} />}

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

        <footer className="mt-12 text-center text-xs text-mist-soft/70">
          © 2026 Sekolah Ormawa PKU · Pengumuman Hasil Seleksi
        </footer>
      </main>
    </>
  );
}
