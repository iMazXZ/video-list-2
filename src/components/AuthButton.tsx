// src/components/AuthButton.tsx

"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <p className="text-gray-900">{session.user?.name}</p>
        <button
          onClick={() => signOut()}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("github")}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      Sign In with GitHub
    </button>
  );
}
