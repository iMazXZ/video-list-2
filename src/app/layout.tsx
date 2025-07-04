// src/app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";
import Navbar from "@/components/Navbar"; // <-- Impor Navbar

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VideoHub",
  description: "Koleksi video terbaik",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50`}>
        <Providers>
          <Navbar /> {/* <-- Tambahkan Navbar di sini */}
          <main className="container mx-auto p-6">{children}</main>{" "}
          {/* <-- Bungkus konten */}
        </Providers>
      </body>
    </html>
  );
}
