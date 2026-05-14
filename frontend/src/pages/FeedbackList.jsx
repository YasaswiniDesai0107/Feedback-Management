/**
 * src/pages/FeedbackList.jsx
 * ---------------------------
 * Displays all feedback records as a grid of cards.
 *
 * Features:
 *   - Fetches all feedbacks via useFeedbacks hook
 *   - Renders FeedbackCard components in a responsive grid
 *   - Delete with confirmation dialog + optimistic UI
 *   - Loading spinner, empty state, error state
 *   - Record count badge
 *
 * API: GET /api/v1/feedback/
 *      DELETE /api/v1/feedback/{id}
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import FeedbackCard from '../components/FeedbackCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import useFeedbacks from '../hooks/useFeedbacks';

const FeedbackList = () => {
  const navigate = useNavigate();
  const { feedbacks, loading, error, deleteFeedbackById, refetch } = useFeedbacks();

  // ID of the feedback currently pending delete confirmation (null if none)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Step 1: user clicks Delete → show confirm dialog
  const handleDeleteRequest = (id) => {
    setConfirmDeleteId(id);
  };

  // Step 2: user confirms → call the actual delete
  const handleDeleteConfirm = async () => {
    if (confirmDeleteId !== null) {
      await deleteFeedbackById(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  return (
    <MainLayout title="All Feedbacks">
      <div className="max-w-6xl mx-auto animate-fade-in">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="page-title">All Feedbacks</h2>
            {!loading && !error && (
              <p className="text-gray-400 text-sm mt-1">
                {feedbacks.length} {feedbacks.length === 1 ? 'record' : 'records'} found
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh button */}
            <button
              onClick={refetch}
              disabled={loading}
              className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-50"
              title="Refresh list"
            >
              <span className={loading ? 'animate-spin inline-block' : ''}>↻</span>
              Refresh
            </button>
            {/* Submit new */}
            <button
              onClick={() => navigate('/submit')}
              className="btn-primary text-sm"
            >
              + New Feedback
            </button>
          </div>
        </div>

        {/* ── Loading state ── */}
        {loading && <LoadingSpinner message="Fetching feedbacks..." />}

        {/* ── Error state ── */}
        {!loading && error && (
          <div className="card p-8 text-center border-red-500/20">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-red-400 font-semibold">{error}</p>
            <p className="text-gray-500 text-sm mt-1 mb-4">
              Make sure the FastAPI backend is running on port 8000.
            </p>
            <button onClick={refetch} className="btn-primary text-sm">
              Try Again
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && feedbacks.length === 0 && (
          <EmptyState
            icon="📭"
            title="No feedbacks yet"
            message="Be the first to submit feedback for a program."
            action={
              <button onClick={() => navigate('/submit')} className="btn-primary">
                Submit Feedback
              </button>
            }
          />
        )}

        {/* ── Feedback cards grid ── */}
        {!loading && !error && feedbacks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {feedbacks.map((feedback) => (
              <FeedbackCard
                key={feedback.feedback_id}
                feedback={feedback}
                onDelete={handleDeleteRequest}
              />
            ))}
          </div>
        )}

        {/* ── Delete Confirmation Modal ── */}
        {confirmDeleteId !== null && (
          // Overlay backdrop
          <div
            className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <div className="card p-6 max-w-sm w-full animate-slide-up">
              <div className="text-center mb-5">
                <span className="text-4xl">🗑️</span>
                <h3 id="delete-modal-title" className="text-lg font-semibold text-white mt-3">
                  Delete Feedback?
                </h3>
                <p className="text-gray-400 text-sm mt-2">
                  This action cannot be undone. The feedback record will be permanently removed.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="btn-danger flex-1"
                >
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
