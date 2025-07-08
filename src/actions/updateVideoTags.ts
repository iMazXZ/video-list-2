'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateVideoTags(videoId: string, tagsString: string) {
  if (!videoId) {
    return { error: 'Video ID is required.' };
  }

  // 1. Bersihkan string input, tapi pertahankan huruf aslinya
  const tagNames = tagsString
    .split(',')
    .map(tag => tag.trim()) // .toLowerCase() telah dihapus
    .filter(tag => tag.length > 0); // Hapus tag kosong

  try {
    await prisma.$transaction(async (tx) => {
      // 2. Hapus semua relasi tag yang ada untuk video ini
      await tx.videoTag.deleteMany({
        where: { videoId: videoId },
      });

      if (tagNames.length > 0) {
        // 3. Cari tag yang sudah ada atau buat yang baru (upsert)
        // Pencarian 'where: { name }' sekarang akan case-sensitive
        const tags = await Promise.all(
          tagNames.map(name => 
            tx.tag.upsert({
              where: { name },
              update: {},
              create: { name },
            })
          )
        );

        // 4. Buat relasi baru di tabel VideoTag
        await tx.videoTag.createMany({
          data: tags.map(tag => ({
            videoId: videoId,
            tagId: tag.id,
          })),
        });
      }
    });

    revalidatePath('/admin');
    revalidatePath(`/video/${videoId}`); // Revalidate halaman detail juga
    return { success: 'Tags updated successfully!' };

  } catch (error) {
    console.error('Failed to update tags:', error);
    return { error: 'Could not update tags.' };
  }
}
