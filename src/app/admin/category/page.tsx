// src/app/admin/category/page.tsx
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DeleteCategoryForm } from "@/components/DeleteCategoryForm";
import { AddCategoryForm } from "@/components/AddCategoryForm";

export default async function CategoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Manajemen Kategori
        </h1>

        {/* Form Tambah Kategori */}
        <AddCategoryForm />

        {/* Daftar Kategori */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Daftar Kategori
          </h2>
          {categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada kategori yang tersedia
            </div>
          ) : (
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className="border border-gray-200 px-4 py-3 text-gray-800 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow flex justify-between items-center"
                >
                  <span className="font-medium">{cat.name}</span>
                  <DeleteCategoryForm
                    categoryId={cat.id}
                    categoryName={cat.name}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
