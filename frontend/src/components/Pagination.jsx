/**
 * src/components/Pagination.jsx
 * ------------------------------
 * Pagination control component.
 * Shows: Previous / page numbers / Next
 *
 * Props:
 *   currentPage  (number)   — 1-indexed current page
 *   totalPages   (number)   — total number of pages
 *   onPageChange (function) — called with new page number
 */

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Don't render if there's only one page or no pages
  if (!totalPages || totalPages <= 1) return null;

  // Build an array of page numbers to show
  // Strategy: always show first, last, current ±1, and ellipsis gaps
  const getPageNumbers = () => {
    const pages = [];
    const delta = 1; // pages on each side of current

    // Always include page 1
    pages.push(1);

    // Left gap
    if (currentPage - delta > 2) pages.push('...');

    // Pages around current
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      pages.push(i);
    }

    // Right gap
    if (currentPage + delta < totalPages - 1) pages.push('...');

    // Always include last page
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      className="flex items-center justify-center gap-1 mt-6"
      aria-label="Pagination"
    >
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-2 rounded-lg text-sm font-medium
                   bg-gray-800 hover:bg-gray-700 text-gray-300
                   disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        ← Prev
      </button>

      {/* Page number buttons */}
      {pageNumbers.map((num, idx) =>
        num === '...' ? (
          // Ellipsis gap
          <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-600 text-sm">
            …
          </span>
        ) : (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            aria-current={num === currentPage ? 'page' : undefined}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors
              ${num === currentPage
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
          >
            {num}
          </button>
        )
      )}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-2 rounded-lg text-sm font-medium
                   bg-gray-800 hover:bg-gray-700 text-gray-300
                   disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        Next →
      </button>
    </nav>
  );
};

export default Pagination;
