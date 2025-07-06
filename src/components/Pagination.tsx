"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({
  currentPage,
  totalPages,
}: PaginationProps) {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category");
  const sort = searchParams.get("sort") || "newest";
  const query = searchParams.get("q") || "";

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5; // Show fewer pages on mobile

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);

      // Show ellipsis or pages around current page
      if (currentPage > 3) pages.push("...");

      // Calculate start and end pages
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're near the start or end
      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        if (i > 1 && i < totalPages) pages.push(i);
      }

      // Show ellipsis or last pages
      if (currentPage < totalPages - 2) pages.push("...");

      // Always show last page
      if (totalPages > 1) pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex justify-center mt-8 overflow-x-auto">
      <div className="flex items-center gap-1 bg-gray-800 rounded-full p-1">
        {/* Previous Button */}
        {currentPage > 1 && (
          <Link
            href={`/?page=${currentPage - 1}${
              selectedCategory ? `&category=${selectedCategory}` : ""
            }${sort ? `&sort=${sort}` : ""}${query ? `&q=${query}` : ""}`}
            className="px-3 py-2 rounded-full bg-gray-700 text-white hover:bg-green-600 transition-all duration-300 flex items-center gap-1 text-sm sm:text-base"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="hidden sm:inline">Previous</span>
          </Link>
        )}

        {/* Page Numbers */}
        {getPageNumbers().map((page, index) =>
          typeof page === "string" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 py-2 text-gray-500 text-sm"
            >
              {page}
            </span>
          ) : (
            <Link
              key={page}
              href={`/?page=${page}${
                selectedCategory ? `&category=${selectedCategory}` : ""
              }${sort ? `&sort=${sort}` : ""}${query ? `&q=${query}` : ""}`}
              className={`px-3 py-2 rounded-full text-sm sm:text-base font-medium transition-all duration-300 ${
                page === currentPage
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {page}
            </Link>
          )
        )}

        {/* Next Button */}
        {currentPage < totalPages && (
          <Link
            href={`/?page=${currentPage + 1}${
              selectedCategory ? `&category=${selectedCategory}` : ""
            }${sort ? `&sort=${sort}` : ""}${query ? `&q=${query}` : ""}`}
            className="px-3 py-2 rounded-full bg-gray-700 text-white hover:bg-green-600 transition-all duration-300 flex items-center gap-1 text-sm sm:text-base"
          >
            <span className="hidden sm:inline">Next</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}
