// src/components/DeleteCategoryForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

// Changed from default export to named export
export function DeleteCategoryForm({
  categoryId,
  categoryName,
}: {
  categoryId: number;
  categoryName: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Yakin ingin menghapus kategori "${categoryName}"?`)) return;

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Kategori berhasil dihapus");
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.message || "Gagal menghapus kategori");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus kategori");
      console.error("Delete error:", error);
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:text-red-800 px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
      title="Hapus kategori"
    >
      Hapus
    </button>
  );
}
