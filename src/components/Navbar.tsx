// src/components/Navbar.tsx

import Link from "next/link";
import AuthButton from "./AuthButton";

export default function Navbar() {
  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">
          VideoHub
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-gray-700 hover:text-blue-600">
            Admin
          </Link>
          <Link
            href="/admin/category"
            className="text-gray-700 hover:text-blue-600"
          >
            Kategori
          </Link>
          <AuthButton />
        </div>
      </nav>
    </header>
  );
}
