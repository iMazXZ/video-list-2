// src/actions/addCategory.ts
'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addCategory(formData: FormData) {
  const name = formData.get('name') as string;
  
  if (!name) {
    return { error: 'Nama kategori tidak boleh kosong' };
  }

  try {
    await prisma.category.create({ data: { name } });
    revalidatePath('/admin/category');
    return { success: 'Kategori berhasil ditambahkan' };
  } catch (error) {
    console.error('Error adding category:', error);
    return { error: 'Gagal menambahkan kategori' };
  }
}