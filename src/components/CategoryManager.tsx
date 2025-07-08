// src/components/CategoryManager.tsx
"use client";

import { useState, useRef, useTransition } from "react";
import { FiPlus, FiTrash2, FiX, FiLoader } from "react-icons/fi";
import { toast } from "react-hot-toast"; // Pastikan Anda sudah install react-hot-toast
import { addCategory } from "@/actions/addCategory";
import { deleteCategory } from "@/actions/deleteCategory";

// Definisikan tipe untuk kategori
type Category = {
  id: number;
  name: string;
};

interface CategoryManagerProps {
  categories: Category[];
}

export default function CategoryManager({ categories }: CategoryManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleAddCategory = async (formData: FormData) => {
    const name = formData.get("name") as string;
    if (!name.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }

    startTransition(async () => {
      const result = await addCategory(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Category "${name}" added!`);
        formRef.current?.reset();
      }
    });
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete the category "${name}"?`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteCategory(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Category "${name}" deleted!`);
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
      >
        Manage Categories
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-lg font-bold text-white">
                Manage Categories
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Add Category Form */}
              <div>
                <h3 className="text-md font-semibold text-white mb-2">
                  Add New Category
                </h3>
                <form
                  ref={formRef}
                  action={handleAddCategory}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    name="name"
                    placeholder="New category name"
                    required
                    disabled={isPending}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center justify-center disabled:bg-blue-400"
                  >
                    {isPending ? (
                      <FiLoader className="animate-spin" />
                    ) : (
                      <FiPlus />
                    )}
                  </button>
                </form>
              </div>

              {/* Existing Categories List */}
              <div className="max-h-60 overflow-y-auto pr-2">
                <h3 className="text-md font-semibold text-white mb-2">
                  Existing Categories
                </h3>
                <ul className="space-y-2">
                  {categories.map((cat) => (
                    <li
                      key={cat.id}
                      className="flex justify-between items-center bg-gray-700 p-2 rounded-md"
                    >
                      <span className="text-white">{cat.name}</span>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        disabled={isPending}
                        className="text-red-500 hover:text-red-400 disabled:text-gray-500"
                        title={`Delete ${cat.name}`}
                      >
                        <FiTrash2 />
                      </button>
                    </li>
                  ))}
                  {categories.length === 0 && (
                    <p className="text-gray-400 text-sm">
                      No categories found.
                    </p>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
