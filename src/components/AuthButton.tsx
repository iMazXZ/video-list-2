"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";

export default function AuthButton() {
  const { data: session } = useSession();

  return session ? (
    <div className="flex gap-4 items-center">
      <p className="text-white">Hi, {session.user?.name}</p>
      <button
        onClick={() => signOut()}
        className="bg-red-500 text-white px-3 py-1 rounded"
      >
        Logout
      </button>
    </div>
  ) : (
    <button
      onClick={() => signIn("github")}
      className="bg-blue-600 text-white px-3 py-1 rounded"
    >
      Login
    </button>
  );
}
