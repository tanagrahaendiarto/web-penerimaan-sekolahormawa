import type { Metadata } from "next";
import MotionProvider from "@/components/MotionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pengumuman Hasil Seleksi — Sekolah Ormawa PKU",
  description: "Cek hasil seleksi Sekolah Ormawa PKU 2026 dengan NIM kamu.",
  icons: { icon: "/logo-so.png" },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
