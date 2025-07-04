// src/app/admin/assign/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache"; // <-- 1. Impor revalidatePath

export async function POST(req: Request) {
  const formData = await req.formData();
  const videoId = formData.get("videoId") as string;
  const categoryId = Number(formData.get("categoryId"));

  if (!videoId || !categoryId) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Simpan relasi ke DB (hindari duplikat)
  await prisma.videoCategory.upsert({
    where: {
      videoId_categoryId: {
        videoId,
        categoryId,
      },
    },
    update: {},
    create: {
      videoId,
      categoryId,
    },
  });

  // 2. Beritahu Next.js untuk merevalidasi cache halaman admin
  revalidatePath("/admin"); 

  // 3. Lakukan redirect setelah revalidasi
  redirect("/admin"); 
}