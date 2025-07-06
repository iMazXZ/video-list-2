"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function AdminPagination({
  currentPage,
  totalPages,
}: AdminPaginationProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  // Improved page number calculation
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);

      let start = Math.max(2, currentPage - halfVisible);
      let end = Math.min(totalPages - 1, currentPage + halfVisible);

      // Adjust if we're near the start or end
      if (currentPage <= halfVisible + 1) {
        end = maxVisiblePages - 1;
      } else if (currentPage >= totalPages - halfVisible) {
        start = totalPages - maxVisiblePages + 2;
      }

      // Add ellipsis if needed
      if (start > 2) pages.push("...");

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) pages.push("...");

      // Always show last page if different from first
      if (totalPages > 1) pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex justify-center mt-8">
      <div className="flex items-center gap-1 bg-gray-800 rounded-full p-1">
        {/* Previous Button */}
        {currentPage > 1 && (
          <Link
            href={`/admin?page=${currentPage - 1}${query ? `&q=${query}` : ""}`}
            className="px-4 py-2 rounded-full bg-gray-700 text-white hover:bg-blue-600 transition-colors flex items-center gap-1"
            aria-label="Previous page"
          >
            <span className="hidden sm:inline">Previous</span>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
        )}

        {/* Page Numbers */}
        {getPageNumbers().map((page, index) =>
          typeof page === "number" ? (
            <Link
              key={page}
              href={`/admin?page=${page}${query ? `&q=${query}` : ""}`}
              className={`px-4 py-2 rounded-full min-w-[40px] text-center ${
                page === currentPage
                  ? "bg-blue-600 text-white font-medium"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </Link>
          ) : (
            <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-400">
              {page}
            </span>
          )
        )}

        {/* Next Button */}
        {currentPage < totalPages && (
          <Link
            href={`/admin?page=${currentPage + 1}${query ? `&q=${query}` : ""}`}
            className="px-4 py-2 rounded-full bg-gray-700 text-white hover:bg-blue-600 transition-colors flex items-center gap-1"
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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
