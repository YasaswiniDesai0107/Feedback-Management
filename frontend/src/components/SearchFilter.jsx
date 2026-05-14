/**
 * src/components/SearchFilter.jsx
 * --------------------------------
 * Unified search bar + filter dropdowns component.
 *
 * Features:
 *   - Text search input (debounced via useSearch hook)
 *   - Rating filter dropdown (All / 1★ – 5★)
 *   - Program name filter dropdown (populated from API)
 *   - Active filter count badge
 *   - Clear all filters button
 *   - Result count display
 *
 * Props:
 *   keyword        / setKeyword        — text search
 *   ratingFilter   / setRatingFilter   — rating ('' or '1'–'5')
 *   programFilter  / setProgramFilter  — program name
 *   programs       — string[] from GET /feedback/programs
 *   hasActiveFilters — boolean
 *   resetFilters   — function to clear all filters
 *   total          — number of matching results (for count display)
 *   loading        — boolean (shows spinner on search input)
 */

const ratingOptions = [
  { value: '',  label: 'All Ratings' },
  { value: '5', label: '⭐⭐⭐⭐⭐  Excellent (5)' },
  { value: '4', label: '⭐⭐⭐⭐   Great (4)'     },
  { value: '3', label: '⭐⭐⭐    Good (3)'       },
  { value: '2', label: '⭐⭐     Fair (2)'        },
  { value: '1', label: '⭐      Poor (1)'         },
];

const SearchFilter = ({
  keyword,        setKeyword,
  ratingFilter,   setRatingFilter,
  programFilter,  setProgramFilter,
  programs = [],
  hasActiveFilters,
  resetFilters,
  total,
  loading,
}) => {
  // Count how many filters are active (for the badge)
  const activeCount = [keyword, ratingFilter, programFilter].filter(Boolean).length;

  return (
    <div className="card p-4 space-y-3">
      {/* Top row: search input + active filter badge */}
      <div className="flex items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          {/* Search icon */}
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm select-none pointer-events-none">
            🔍
          </span>
          <input
            id="search-input"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by name, program, or comments..."
            className="form-input pl-9 pr-10 py-2.5"
            aria-label="Search feedbacks"
          />
          {/* Loading indicator inside input */}
          {loading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin inline-block" />
            </span>
          )}
          {/* Clear search button (X) */}
          {keyword && !loading && (
            <button
              onClick={() => setKeyword('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Active filter badge + clear button */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2
                       bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg
                       border border-blue-500/20 transition-colors flex-shrink-0"
            title="Clear all filters"
          >
            <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
              {activeCount}
            </span>
            Clear
          </button>
        )}
      </div>

      {/* Filter dropdowns row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Rating filter */}
        <div className="flex-1">
          <label htmlFor="rating-filter" className="sr-only">Filter by rating</label>
          <select
            id="rating-filter"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="form-input py-2 text-sm cursor-pointer"
          >
            {ratingOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Program filter */}
        <div className="flex-1">
          <label htmlFor="program-filter" className="sr-only">Filter by program</label>
          <select
            id="program-filter"
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="form-input py-2 text-sm cursor-pointer"
            disabled={programs.length === 0}
          >
            <option value="">All Programs</option>
            {programs.map((prog) => (
              <option key={prog} value={prog}>
                {prog}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result count */}
      {(hasActiveFilters || total !== undefined) && (
        <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
          <span>
            {loading
              ? 'Searching...'
              : `${total ?? 0} result${total !== 1 ? 's' : ''} found`}
          </span>
          {hasActiveFilters && (
            <span className="text-blue-400">Filters active</span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
