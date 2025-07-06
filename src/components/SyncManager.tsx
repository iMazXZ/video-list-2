"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// --- Icons ---
const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);
const RefreshCwIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M3 12a9 9 0 0 1 9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);
const LoaderIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    className="animate-spin"
  >
    <path
      d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
      opacity=".25"
    />
    <path d="M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z" />
  </svg>
);

export default function SyncManagerSimple() {
  const [loading, setLoading] = useState<null | "latest" | "full">(null);
  const router = useRouter();

  const handleSync = async (syncType: "latest" | "full") => {
    setLoading(syncType);

    try {
      const response = await fetch(`/api/sync-videos?syncType=${syncType}`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "An unknown error occurred.");
      }

      toast.success(result.message);
      router.refresh(); // Refresh server components to show new data
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to perform sync."
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center justify-start gap-4 p-4">
      {/* Latest 10 Sync Button */}
      <button
        onClick={() => handleSync("latest")}
        disabled={!!loading}
        className="flex items-center gap-2 px-4 py-2 rounded-md font-medium bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white transition-all duration-300"
        title="Sync Latest 10 Videos"
      >
        {loading === "latest" ? <LoaderIcon /> : <ClockIcon />}
        <span>10 Latest Sync</span>
      </button>

      {/* Full Sync Button */}
      <button
        onClick={() => handleSync("full")}
        disabled={!!loading}
        className="flex items-center gap-2 px-4 py-2 rounded-md font-medium bg-amber-600 hover:bg-amber-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white transition-all duration-300"
        title="Start a Full Sync"
      >
        {loading === "full" ? <LoaderIcon /> : <RefreshCwIcon />}
        <span>Full Sync</span>
      </button>
    </div>
  );
}
