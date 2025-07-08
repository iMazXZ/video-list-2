// src/actions/assignCategory.ts
'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function assignCategory(formData: FormData) {
  const videoId = formData.get('videoId') as string;
  const categoryId = Number(formData.get('categoryId'));

  if (!videoId || !categoryId) {
    console.error("Input tidak valid");
    return;
  }

  try {
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

    // Cukup revalidate path, tidak perlu redirect.
    // Next.js akan secara otomatis me-render ulang halaman dengan data baru.
    revalidatePath('/admin');

  } catch (error) {
    console.error('Gagal menetapkan kategori:', error);
    // Anda bisa mengembalikan pesan error di sini jika perlu
  }
}