/**
 * src/components/FeedbackCard.jsx
 * ---------------------------------
 * Displays a single feedback entry as a card in the list view.
 *
 * Props:
 *   feedback          (object)   — the feedback record from the API
 *   onDelete          (function) — called with feedback_id when Delete is clicked
 *   onViewDetails     (function) — called with feedback_id when card/title is clicked
 *   onEdit            (function) — called with feedback_id when Edit is clicked
 */

import { useNavigate } from 'react-router-dom';
import RatingStars from './RatingStars';

// Helper: format ISO date string to readable format
const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Helper: rating badge color
const ratingBadgeColor = (rating) => {
  if (rating >= 4) return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
  if (rating === 3) return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
  return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
};

const FeedbackCard = ({ feedback, onDelete }) => {
  const navigate = useNavigate();

  const {
    feedback_id,
    participant_name,
    program_name,
    rating,
    comments,
    submitted_at,
  } = feedback;

  return (
    <div className="card p-5 hover:border-gray-700 transition-all duration-200 animate-slide-up group">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          {/* Participant name — clickable to view details */}
          <button
            onClick={() => navigate(`/feedback/${feedback_id}`)}
            className="text-base font-semibold text-white hover:text-blue-400 transition-colors truncate text-left w-full"
          >
            {participant_name}
          </button>
          {/* Program badge */}
          <span className="inline-block mt-1 text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-full">
            {program_name}
          </span>
        </div>

        {/* Rating badge */}
        <div className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold ${ratingBadgeColor(rating)}`}>
          ★ {rating}/5
        </div>
      </div>

      {/* Star visual */}
      <div className="mb-3">
        <RatingStars rating={rating} size="sm" />
      </div>

      {/* Comments */}
      {comments ? (
        <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 mb-4">
          {comments}
        </p>
      ) : (
        <p className="text-sm text-gray-600 italic mb-4">No comments provided.</p>
      )}

      {/* Footer: date + actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-800">
        {/* Timestamp */}
        <span className="text-xs text-gray-500">{formatDate(submitted_at)}</span>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* View Details */}
          <button
            onClick={() => navigate(`/feedback/${feedback_id}`)}
            className="text-xs px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
          >
            View
          </button>
          {/* Edit */}
          <button
            onClick={() => navigate(`/feedback/${feedback_id}/edit`)}
            className="text-xs px-3 py-1.5 rounded-md bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 transition-colors"
          >
            Edit
          </button>
          {/* Delete */}
          <button
            onClick={() => onDelete(feedback_id)}
            className="text-xs px-3 py-1.5 rounded-md bg-red-600/20 hover:bg-red-600/40 text-red-400 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackCard;
