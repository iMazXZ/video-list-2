// src/components/AddCategoryForm.tsx
"use client";

import { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { addCategory } from "@/actions/addCategory";

export function AddCategoryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await addCategory(formData);

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success(result.success);
        // Use the formRef instead of event.currentTarget
        formRef.current?.reset();
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengirim formulir");
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        name="name"
        placeholder="Masukkan nama kategori"
        className="border border-gray-300 px-4 py-2 text-gray-900 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required
        minLength={2}
        maxLength={50}
        disabled={isSubmitting}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap disabled:bg-blue-400"
      >
        {isSubmitting ? "Menambahkan..." : "Tambah Kategori"}
      </button>
    </form>
  );
}
