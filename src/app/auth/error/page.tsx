// src/app/auth/error/page.tsx
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white p-8 rounded shadow-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Auth Error</h1>
        {error && <p className="text-gray-700">Error: {error}</p>}
        {message && <p className="text-gray-700">{message}</p>}
        <a href="/" className="text-blue-600 mt-4 inline-block">
          Go back home
        </a>
      </div>
    </div>
  );
}
