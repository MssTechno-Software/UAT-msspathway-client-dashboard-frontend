import { ChevronLeft, ChevronRight } from "lucide-react";
// Reusable pagination component for page navigation and row-count selection.
const Pagination = ({
  page = 1,
  totalPages = 1,
  pageSize = 25,
  onPageChange,
  onPageSizeChange,
}) => {
  // Generate the first three page numbers and the last page when needed.
  const renderPages = () => {
    const pages = [];

    // First 3 pages
    for (let i = 1; i <= Math.min(3, totalPages); i++) {
      pages.push(i);
    }

    // Ellipsis
    if (totalPages > 4) {
      pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between w-full">

      {/* Left */}
      <select
        value={pageSize}
        // Notify the parent when the selected number of rows changes.
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="border border-gray-300 text-[11px] px-2 py-1 rounded bg-white"
      >
        <option value={10}>10 Rows</option>
        <option value={25}>25 Rows</option>
        <option value={50}>50 Rows</option>
      </select>

      {/* Right */}
      <div className="flex items-center gap-2">

        <button
          // Disable previous-page navigation on the first page.
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronLeft size={14} />
        </button>

        {renderPages().map((item, index) =>
          item === "..." ? (
            <span
              key={index}
              className="text-gray-500 text-sm"
            >
              ...
            </span>
          ) : (
            <button
              key={item}
              // Highlight the current page and notify the parent when another page is selected.
              onClick={() => onPageChange(item)}
              className={`w-7 h-7 rounded text-xs font-medium
              ${
                page === item
                  ? "bg-[#2d5a27] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          // Disable next-page navigation when the last page is reached.
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronRight size={14} />
        </button>
      </div>

    </div>
  );
};

export default Pagination;