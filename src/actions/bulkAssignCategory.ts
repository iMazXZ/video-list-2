'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Menetapkan satu kategori ke beberapa video sekaligus.
 * @param videoIds - Array dari ID video (string) yang akan diubah.
 * @param categoryId - ID kategori (number) yang akan ditetapkan.
 */
export async function bulkAssignCategory(videoIds: string[], categoryId: number) {
  if (!videoIds || videoIds.length === 0 || !categoryId) {
    return { error: 'Invalid input: Video IDs and Category ID are required.' };
  }

  try {
    // Prisma transaction untuk memastikan semua operasi berhasil atau tidak sama sekali.
    await prisma.$transaction(async (tx) => {
      // 1. Hapus semua asosiasi kategori yang ada untuk video-video yang dipilih.
      // Ini menyederhanakan logika, memastikan setiap video hanya punya satu kategori setelah ini.
      await tx.videoCategory.deleteMany({
        where: {
          videoId: {
            in: videoIds,
          },
        },
      });

      // 2. Buat asosiasi baru untuk setiap video dengan kategori yang dipilih.
      const newAssignments = videoIds.map((videoId) => ({
        videoId: videoId,
        categoryId: categoryId,
      }));

      await tx.videoCategory.createMany({
        data: newAssignments,
        skipDuplicates: true, // Untuk keamanan, lewati jika ada duplikat
      });
    });

    revalidatePath('/admin');
    return { success: `${videoIds.length} videos have been assigned to the new category.` };

  } catch (error) {
    console.error('Bulk assign error:', error);
    return { error: 'An error occurred during the bulk assign operation.' };
  }
}
