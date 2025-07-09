import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/app/providers";
import Script from "next/script"; // 1. Impor komponen Script

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
          <Footer />
        </Providers>

        {/* 2. Tambahkan skrip Histats di sini */}
        <Script id="histats-script" strategy="lazyOnload">
          {`
            var _Hasync= _Hasync|| [];
            _Hasync.push(['Histats.start', '1,4962377,4,0,0,0,00010000']);
            _Hasync.push(['Histats.fasi', '1']);
            _Hasync.push(['Histats.track_hits', '']);
            (function() {
            var hs = document.createElement('script'); hs.type = 'text/javascript'; hs.async = true;
            hs.src = ('//s10.histats.com/js15_as.js');
            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(hs);
            })();
          `}
        </Script>
        <noscript>
          <a href="/" target="_blank">
            <img
              src="//sstatic1.histats.com/0.gif?4962377&101"
              alt="Histats"
              style={{ border: 0 }}
            />
          </a>
        </noscript>
        {/* Histats.com END */}
      </body>
    </html>
  );
}
