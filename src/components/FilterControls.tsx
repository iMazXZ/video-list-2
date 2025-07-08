"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";

type Category = {
  id: number;
  name: string;
};

interface FilterControlsProps {
  categories: Category[];
}

export default function FilterControls({ categories }: FilterControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get("category");
  const currentSort = searchParams.get("sort") || "newest";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;

    // Perbaikan: Ubah searchParams menjadi string sebelum membuat instance baru
    const params = new URLSearchParams(searchParams.toString());

    params.set("sort", newSort);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Category Links */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={searchParams.has("q") ? `/?q=${searchParams.get("q")}` : "/"}
          className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
            !selectedCategory
              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("category", cat.name);
          return (
            <Link
              key={cat.id}
              href={`${pathname}?${params.toString()}`}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
                selectedCategory === cat.name
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>

      {/* Sort Dropdown */}
      <div>
        <label
          htmlFor="sort-by"
          className="text-sm font-medium text-gray-400 mr-2"
        >
          Sort by:
        </label>
        <select
          id="sort-by"
          value={currentSort}
          onChange={handleSortChange}
          className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="newest">Newest</option>
          <option value="popular">Most Popular</option>
          <option value="oldest">Oldest</option>
          <option value="az">A-Z</option>
          <option value="za">Z-A</option>
        </select>
      </div>
    </div>
  );
}
