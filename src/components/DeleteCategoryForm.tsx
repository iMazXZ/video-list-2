// src/components/DeleteCategoryForm.tsx

"use client"; // <-- Tandai sebagai Client Component

import React from "react";

// Komponen ini menerima categoryId sebagai prop
export default function DeleteCategoryForm({
  categoryId,
}: {
  categoryId: number;
}) {
  // Fungsi untuk menangani event submit
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // Tampilkan dialog konfirmasi di browser
    const userConfirmed = confirm("Yakin ingin hapus kategori ini?");

    // Jika pengguna membatalkan, hentikan pengiriman form
    if (!userConfirmed) {
      event.preventDefault();
    }
  };

  return (
    <form
      action={`/admin/category/delete`}
      method="POST"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="id" value={categoryId} />
      <button className="text-red-600 hover:underline text-sm" type="submit">
        Hapus
      </button>
    </form>
  );
}
