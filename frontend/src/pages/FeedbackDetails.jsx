/**
 * src/pages/FeedbackDetails.jsx
 * ------------------------------
 * Displays the full details of a single feedback record.
 *
 * Features:
 *   - Reads :id from the URL using useParams
 *   - Fetches one feedback record via feedbackService.getFeedbackById
 *   - Shows all fields: name, program, rating stars, comments, timestamp
 *   - Edit and Delete action buttons
 *   - Loading, error, and not-found states
 *
 * API: GET /api/v1/feedback/{id}
 *      DELETE /api/v1/feedback/{id}
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import MainLayout from '../layouts/MainLayout';
import RatingStars from '../components/RatingStars';
import LoadingSpinner from '../components/LoadingSpinner';
import { getFeedbackById, deleteFeedback } from '../services/feedbackService';

// Format full date + time
const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// Detail row helper — renders a label + value pair
const DetailRow = ({ label, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-4 border-b border-gray-800 last:border-0">
    <span className="text-sm font-medium text-gray-500 sm:w-36 flex-shrink-0">{label}</span>
    <div className="flex-1">{children}</div>
  </div>
);

const FeedbackDetails = () => {
  const { id }    = useParams();   // get :id from the URL
  const navigate  = useNavigate();

  const [feedback,   setFeedback]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting,   setDeleting]   = useState(false);

  // Fetch the feedback record on component mount
  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getFeedbackById(id);
        setFeedback(data);
      } catch (err) {
        setError(err.userMessage || 'Feedback not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [id]); // re-fetch if the id changes

  // Handle delete
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteFeedback(id);
      toast.success('Feedback deleted.');
      navigate('/feedbacks');  // go back to list
    } catch (err) {
      toast.error(err.userMessage || 'Failed to delete.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <MainLayout title="Feedback Details">
      <div className="max-w-2xl mx-auto animate-fade-in">

        {/* Back button */}
        <button
          onClick={() => navigate('/feedbacks')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
        >
          ← Back to All Feedbacks
        </button>

        {/* Loading */}
        {loading && <LoadingSpinner message="Loading feedback details..." />}

        {/* Error / Not found */}
        {!loading && error && (
          <div className="card p-8 text-center border-red-500/20">
            <p className="text-4xl mb-3">❌</p>
            <p className="text-red-400 font-semibold">{error}</p>
            <button onClick={() => navigate('/feedbacks')} className="btn-secondary mt-4 text-sm">
              Go Back
            </button>
          </div>
        )}

        {/* Feedback detail card */}
        {!loading && !error && feedback && (
          <>
            <div className="card p-6 lg:p-8">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-600">
                      ID #{feedback.feedback_id}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{feedback.participant_name}</h2>
                  <span className="inline-block mt-1.5 text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                    {feedback.program_name}
                  </span>
                </div>

                {/* Large rating badge */}
                <div className="text-center flex-shrink-0">
                  <p className="text-4xl font-black text-amber-400">{feedback.rating}</p>
                  <p className="text-xs text-gray-500">out of 5</p>
                </div>
              </div>

              {/* Detail rows */}
              <div>
                <DetailRow label="Rating">
                  <RatingStars rating={feedback.rating} size="md" />
                </DetailRow>

                <DetailRow label="Comments">
                  {feedback.comments ? (
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {feedback.comments}
                    </p>
                  ) : (
                    <p className="text-gray-600 italic text-sm">No comments provided.</p>
                  )}
                </DetailRow>

                <DetailRow label="Submitted At">
                  <p className="text-gray-300 text-sm">
                    {formatDateTime(feedback.submitted_at)}
                  </p>
                </DetailRow>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={() => navigate(`/feedback/${id}/edit`)}
                className="btn-primary"
              >
                ✏️ Edit Feedback
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn-danger"
              >
                🗑️ Delete
              </button>
              <button
                onClick={() => navigate('/feedbacks')}
                className="btn-secondary"
              >
                Back to List
              </button>
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4">
            <div className="card p-6 max-w-sm w-full animate-slide-up text-center">
              <span className="text-4xl">🗑️</span>
              <h3 className="text-lg font-semibold text-white mt-3">Delete this feedback?</h3>
              <p className="text-gray-400 text-sm mt-2 mb-5">
                This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn-danger flex-1 flex items-center justify-center gap-2"
                >
                  {deleting && (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default FeedbackDetails;
