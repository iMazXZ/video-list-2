// src/app/admin/category/delete/route.ts

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache"; // <-- 1. Impor revalidatePath

export async function POST(req: Request) {
  const formData = await req.formData();
  const id = Number(formData.get("id"));

  if (!id) return;

  // Hapus relasi terkait terlebih dahulu (praktik yang baik)
  await prisma.videoCategory.deleteMany({
    where: { categoryId: id },
  });

  // Baru hapus kategorinya
  await prisma.category.delete({ where: { id } });

  // 2. Revalidasi path halaman kategori
  revalidatePath("/admin/category");

  // 3. Lakukan redirect setelah revalidasi
  redirect("/admin/category");
}