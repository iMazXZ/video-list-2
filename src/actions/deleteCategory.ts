// src/actions/deleteCategory.ts
'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function deleteCategory(categoryId: number) {
  if (!categoryId) {
    return { error: 'Invalid Category ID' };
  }

  try {
    await prisma.category.delete({
      where: { id: categoryId },
    });
    
    // Revalidate halaman admin agar daftar kategori ter-update
    revalidatePath('/admin');
    return { success: 'Category deleted successfully' };

  } catch (error) {
    console.error('Failed to delete category:', error);
    // Mungkin ada video yang masih menggunakan kategori ini
    return { error: 'Failed to delete category. Make sure no videos are using it.' };
  }
}