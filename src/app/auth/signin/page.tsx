// src/app/auth/signin/page.tsx
"use client";

import { signIn, getProviders } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignIn() {
  const [providers, setProviders] = useState<any>(null);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    fetchProviders();
  }, []);

  if (!providers) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You need to sign in to access admin area
          </p>
        </div>
        <div className="mt-8 space-y-6">
          {Object.values(providers).map((provider: any) => (
            <div key={provider.name}>
              <button
                onClick={() => signIn(provider.id, { callbackUrl })}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in with {provider.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
