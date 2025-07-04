// src/app/admin/category/page.tsx

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import DeleteCategoryForm from "@/components/DeleteCategoryForm"; // <-- 1. Impor komponen baru

export default async function CategoryPage() {
  const categories = await prisma.category.findMany();

  async function addCategory(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;

    if (!name) return;

    await prisma.category.create({
      data: { name },
    });

    revalidatePath("/admin/category");
    redirect("/admin/category");
  }

  return (
    // Anda bisa menghapus className di sini jika sudah menggunakan layout global
    <main>
      <h1 className="text-3xl font-bold">Manajemen Kategori</h1>

      {/* Form Tambah (tidak berubah) */}
      <form action={addCategory} className="flex gap-2 my-8">
        <input
          type="text"
          name="name"
          placeholder="Nama kategori"
          className="border px-3 py-2 text-gray-900 rounded w-full"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Tambah
        </button>
      </form>

      {/* Daftar Kategori */}
      <ul className="space-y-2">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="border px-3 py-2 text-gray-900 rounded bg-white shadow flex justify-between items-center"
          >
            <span>{cat.name}</span>

            {/* 2. Ganti <form> lama dengan komponen baru */}
            <DeleteCategoryForm categoryId={cat.id} />
          </li>
        ))}
      </ul>
    </main>
  );
}
