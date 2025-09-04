import React, { useState } from "react";
import { FaTh, FaTable, FaAngleLeft, FaAngleRight } from "react-icons/fa";

// Pagination Component
export default function  Pagination({ currentPage, totalPages, onPageChange }){
  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Determine pages to display
  const pages = [];
  const maxPagesToShow = 5; // First, second-last, last, current, next, second-next

  // Always show first page
  pages.push(1);

  // Calculate second-last and last pages
  if (totalPages > 1) {
    const secondLast = totalPages - 1;
    const last = totalPages;

    // Add second-last and last pages if they exist and are not already included
    if (secondLast > 1 && !pages.includes(secondLast)) {
      pages.push(secondLast);
    }
    if (last > 1 && !pages.includes(last)) {
      pages.push(last);
    }

    // Add current page and surrounding pages (next and second-next)
    if (currentPage > 1 && !pages.includes(currentPage)) {
      pages.push(currentPage);
    }
    if (currentPage + 1 <= totalPages && !pages.includes(currentPage + 1)) {
      pages.push(currentPage + 1);
    }
    if (currentPage + 2 <= totalPages && !pages.includes(currentPage + 2)) {
      pages.push(currentPage + 2);
    }
  }

  // Sort pages numerically
  pages.sort((a, b) => a - b);

  // Ensure unique pages
  const uniquePages = [...new Set(pages)];

  return (
    <div className="flex justify-center mt-6">
      <div className="flex items-center space-x-2">
        {/* Previous Page (Icon Only) */}
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-full transition-all duration-200 ${
            currentPage === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-teal-500 text-white hover:bg-teal-600"
          }`}
          title="Previous Page"
        >
          <FaAngleLeft size={16} />
        </button>

        {/* Page Numbers */}
        {uniquePages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageClick(page)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              page === currentPage
                ? "bg-teal-500 text-white"
                : "bg-white text-gray-700 hover:bg-teal-50 hover:text-teal-600"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next Page (Icon Only) */}
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-full transition-all duration-200 ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-teal-500 text-white hover:bg-teal-600"
          }`}
          title="Next Page"
        >
          <FaAngleRight size={16} />
        </button>
      </div>
    </div>
  );
}