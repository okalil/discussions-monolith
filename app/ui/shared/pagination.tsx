import React from "react";

interface PaginationProps {
  page: number;
  onPageChange: (page: number) => void;
  totalPages: number;
}

export const Pagination = ({
  page,
  onPageChange,
  totalPages,
}: PaginationProps) => {
  const pages: (number | string)[] = [];
  const startPage = Math.max(1, page - 2);
  const endPage = Math.min(totalPages, page + 2);

  if (startPage > 1) {
    pages.push(1);
    if (startPage > 2) {
      pages.push("...");
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push("...");
    }
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 border rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &laquo; Prev
      </button>

      {pages.map((pageItem, index) => (
        <React.Fragment key={index}>
          {pageItem === "..." ? (
            <span className="px-3 py-1 text-sm text-gray-500">...</span>
          ) : (
            <button
              onClick={() => onPageChange(pageItem as number)}
              className={`px-3 py-1 text-sm font-medium rounded-md hover:bg-blue-500 hover:text-white ${
                pageItem === page
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 bg-gray-100"
              }`}
            >
              {pageItem}
            </button>
          )}
        </React.Fragment>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 border rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next &raquo;
      </button>
    </div>
  );
};
