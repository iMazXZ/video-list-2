// src/app/providers.tsx

"use client"; // Komponen ini adalah komponen klien

import { SessionProvider } from "next-auth/react";
import React from "react";

interface Props {
  children: React.ReactNode;
}

export default function Providers({ children }: Props) {
  return <SessionProvider>{children}</SessionProvider>;
}
