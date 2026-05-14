/**
 * src/pages/FeedbackList.jsx  (Step 3 — updated)
 * ------------------------------------------------
 * Displays feedbacks with live search + filters + pagination.
 *
 * New in Step 3:
 *   - SearchFilter component (keyword + rating + program dropdowns)
 *   - useSearch hook (debounced API calls, pagination state)
 *   - Pagination component (page navigation)
 *   - CSV export button via exportToCSV utility
 *   - Program list fetched on mount for dropdown options
 *   - Falls back to useFeedbacks (all records) when no filters active
 *
 * APIs used:
 *   GET /api/v1/feedback/          (all feedbacks)
 *   GET /api/v1/feedback/search    (search + filter + paginate)
 *   GET /api/v1/feedback/programs  (dropdown options)
 *   DELETE /api/v1/feedback/{id}   (delete)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import MainLayout from '../layouts/MainLayout';
import FeedbackCard from '../components/FeedbackCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import SearchFilter from '../components/SearchFilter';
import Pagination from '../components/Pagination';
import useFeedbacks from '../hooks/useFeedbacks';
import useSearch from '../hooks/useSearch';
import { getDistinctPrograms } from '../services/feedbackService';
import { exportToCSV } from '../utils/helpers';

const FeedbackList = () => {
  const navigate = useNavigate();

  // --- All feedbacks (used when no filter is active) ---
  const {
    feedbacks: allFeedbacks,
    loading: allLoading,
    error: allError,
    deleteFeedbackById,
    refetch: refetchAll,
  } = useFeedbacks();

  // --- Search/filter state + debounced API calls ---
  const {
    results: searchResults,
    total: searchTotal,
    totalPages,
    loading: searchLoading,
    error: searchError,
    keyword, setKeyword,
    ratingFilter, setRatingFilter,
    programFilter, setProgramFilter,
    page, setPage, pageSize,
    hasActiveFilters,
    resetFilters,
  } = useSearch();

  // --- Program list for dropdown ---
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    getDistinctPrograms()
      .then(setPrograms)
      .catch(() => {/* silently ignore dropdown load failure */});
  }, []);

  // --- Delete confirmation modal ---
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleDeleteConfirm = async () => {
    if (confirmDeleteId !== null) {
      await deleteFeedbackById(confirmDeleteId);
      setConfirmDeleteId(null);
      // If in search mode, the list won't auto-update (search results are separate)
      // Just remove from local display by re-searching
      if (hasActiveFilters) resetFilters();
    }
  };

  // --- Determine which dataset + loading state to display ---
  // When filters are active: show search results (paginated)
  // When no filters: show all feedbacks
  const isSearchMode    = hasActiveFilters;
  const displayItems    = isSearchMode ? searchResults : allFeedbacks;
  const displayLoading  = isSearchMode ? searchLoading : allLoading;
  const displayError    = isSearchMode ? searchError   : allError;
  const displayTotal    = isSearchMode ? searchTotal   : allFeedbacks.length;

  return (
    <MainLayout title="All Feedbacks">
      <div className="max-w-6xl mx-auto animate-fade-in space-y-5">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="page-title">All Feedbacks</h2>
            {!displayLoading && !displayError && (
              <p className="text-gray-400 text-sm mt-1">
                {displayTotal} {displayTotal === 1 ? 'record' : 'records'}
                {isSearchMode && ' matched'}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* CSV Export */}
            <button
              id="export-csv-btn"
              onClick={() => exportToCSV(allFeedbacks)}
              disabled={allFeedbacks.length === 0}
              className="btn-secondary text-xs flex items-center gap-1.5 disabled:opacity-50"
              title="Export all feedbacks to CSV"
            >
              📥 Export CSV
            </button>
            {/* Refresh */}
            <button
              onClick={refetchAll}
              disabled={allLoading}
              className="btn-secondary text-sm disabled:opacity-50"
            >
              ↻ Refresh
            </button>
            {/* New feedback */}
            <button
              onClick={() => navigate('/submit')}
              className="btn-primary text-sm"
            >
              + New Feedback
            </button>
          </div>
        </div>

        {/* ── Search + Filter bar ── */}
        <SearchFilter
          keyword={keyword}           setKeyword={setKeyword}
          ratingFilter={ratingFilter} setRatingFilter={setRatingFilter}
          programFilter={programFilter} setProgramFilter={setProgramFilter}
          programs={programs}
          hasActiveFilters={hasActiveFilters}
          resetFilters={resetFilters}
          total={isSearchMode ? searchTotal : undefined}
          loading={searchLoading && isSearchMode}
        />

        {/* ── Loading ── */}
        {displayLoading && <LoadingSpinner message="Loading feedbacks..." />}

        {/* ── Error ── */}
        {!displayLoading && displayError && (
          <div className="card p-8 text-center border-red-500/20">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-red-400 font-semibold">{displayError}</p>
            <p className="text-gray-500 text-sm mt-1 mb-4">
              Make sure the FastAPI backend is running on port 8000.
            </p>
            <button onClick={refetchAll} className="btn-primary text-sm">
              Try Again
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {!displayLoading && !displayError && displayItems.length === 0 && (
          <EmptyState
            icon={isSearchMode ? '🔍' : '📭'}
            title={isSearchMode ? 'No results found' : 'No feedbacks yet'}
            message={
              isSearchMode
                ? 'Try adjusting your search terms or clearing the filters.'
                : 'Be the first to submit feedback for a program.'
            }
            action={
              isSearchMode ? (
                <button onClick={resetFilters} className="btn-secondary">
                  Clear Filters
                </button>
              ) : (
                <button onClick={() => navigate('/submit')} className="btn-primary">
                  Submit Feedback
                </button>
              )
            }
          />
        )}

        {/* ── Feedback cards grid ── */}
        {!displayLoading && !displayError && displayItems.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayItems.map((feedback) => (
                <FeedbackCard
                  key={feedback.feedback_id}
                  feedback={feedback}
                  onDelete={setConfirmDeleteId}
                />
              ))}
            </div>

            {/* Pagination (only shown in search mode) */}
            {isSearchMode && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}

            {/* Page info in search mode */}
            {isSearchMode && totalPages > 1 && (
              <p className="text-center text-xs text-gray-500">
                Page {page} of {totalPages} · {searchTotal} total results
              </p>
            )}
          </>
        )}

        {/* ── Delete Confirmation Modal ── */}
        {confirmDeleteId !== null && (
          <div
            className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="card p-6 max-w-sm w-full animate-slide-up">
              <div className="text-center mb-5">
                <span className="text-4xl">🗑️</span>
                <h3 className="text-lg font-semibold text-white mt-3">Delete Feedback?</h3>
                <p className="text-gray-400 text-sm mt-2">
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDeleteId(null)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button onClick={handleDeleteConfirm} className="btn-danger flex-1">
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default FeedbackList;
