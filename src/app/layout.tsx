import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; // 1. Impor komponen Footer
import Providers from "@/app/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VideoHub",
  description: "Platform Streaming Video",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body
        className={`${inter.className} bg-gray-900 flex flex-col min-h-full`}
      >
        <Providers>
          <div className="flex-grow">
            <Navbar />
            <main>{children}</main>
          </div>
          <Footer /> {/* 2. Tambahkan komponen Footer di sini */}
        </Providers>
      </body>
    </html>
  );
}
