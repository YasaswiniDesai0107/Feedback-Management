/**
 * src/pages/EditFeedback.jsx
 * ---------------------------
 * Edit an existing feedback record.
 *
 * Features:
 *   - Pre-fills the form with existing data fetched from the API
 *   - Supports partial updates (only sends changed fields)
 *   - Client-side validation
 *   - Interactive star picker for updating rating
 *   - PUT request via feedbackService.updateFeedback
 *   - Success toast + redirect to details page
 *
 * API: GET /api/v1/feedback/{id}   (load existing data)
 *      PUT /api/v1/feedback/{id}   (save changes)
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import MainLayout from '../layouts/MainLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { getFeedbackById, updateFeedback } from '../services/feedbackService';

// Inline star picker (same as SubmitFeedback for rating selection)
const StarPicker = ({ value, onChange }) => (
  <div className="flex items-center gap-1" role="group" aria-label="Select rating">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className={`text-3xl transition-transform duration-100 hover:scale-110 focus:outline-none
          ${star <= value ? 'text-amber-400' : 'text-gray-700 hover:text-amber-300'}`}
        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
      >
        ★
      </button>
    ))}
    {value > 0 && (
      <span className="ml-2 text-sm text-gray-400 font-medium">
        {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][value]}
      </span>
    )}
  </div>
);

const EditFeedback = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  // Loading state while fetching existing feedback data
  const [fetching,    setFetching]    = useState(true);
  const [fetchError,  setFetchError]  = useState(null);

  // Form state (pre-filled with existing data)
  const [form,        setForm]        = useState({
    participant_name: '',
    program_name:     '',
    rating:           0,
    comments:         '',
  });

  const [errors,      setErrors]      = useState({});
  const [submitting,  setSubmitting]  = useState(false);

  // Fetch the existing feedback to pre-fill the form
  useEffect(() => {
    const load = async () => {
      setFetching(true);
      try {
        const data = await getFeedbackById(id);
        setForm({
          participant_name: data.participant_name,
          program_name:     data.program_name,
          rating:           data.rating,
          comments:         data.comments || '',
        });
      } catch (err) {
        setFetchError(err.userMessage || 'Could not load feedback data.');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id]);

  // Generic input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleRatingChange = (rating) => {
    setForm((prev) => ({ ...prev, rating }));
    if (errors.rating) setErrors((prev) => ({ ...prev, rating: '' }));
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!form.participant_name.trim())
      newErrors.participant_name = 'Participant name is required.';
    else if (form.participant_name.trim().length < 2)
      newErrors.participant_name = 'Name must be at least 2 characters.';

    if (!form.program_name.trim())
      newErrors.program_name = 'Program name is required.';
    else if (form.program_name.trim().length < 2)
      newErrors.program_name = 'Program name must be at least 2 characters.';

    if (form.rating === 0)
      newErrors.rating = 'Please select a rating.';

    return newErrors;
  };

  // Submit handler — calls PUT API
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors before saving.');
      return;
    }

    const payload = {
      participant_name: form.participant_name.trim(),
      program_name:     form.program_name.trim(),
      rating:           form.rating,
      comments:         form.comments.trim() || null,
    };

    setSubmitting(true);
    try {
      await updateFeedback(id, payload);
      toast.success('Feedback updated successfully! ✅');
      // Navigate back to the details page
      navigate(`/feedback/${id}`);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to update feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout title="Edit Feedback">
      <div className="max-w-2xl mx-auto animate-fade-in">

        {/* Back button */}
        <button
          onClick={() => navigate(`/feedback/${id}`)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
        >
          ← Back to Details
        </button>

        <div className="mb-6">
          <h2 className="page-title">Edit Feedback</h2>
          <p className="text-gray-400 text-sm mt-1">
            Update the feedback details below. ID: <span className="font-mono text-gray-300">#{id}</span>
          </p>
        </div>

        {/* Loading existing data */}
        {fetching && <LoadingSpinner message="Loading feedback data..." />}

        {/* Fetch error */}
        {!fetching && fetchError && (
          <div className="card p-8 text-center border-red-500/20">
            <p className="text-red-400 font-semibold">{fetchError}</p>
            <button onClick={() => navigate('/feedbacks')} className="btn-secondary mt-4 text-sm">
              Go Back
            </button>
          </div>
        )}

        {/* Edit form */}
        {!fetching && !fetchError && (
          <div className="card p-6 lg:p-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-6">

              {/* Participant Name */}
              <div>
                <label htmlFor="edit_participant_name" className="form-label">
                  Participant Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="edit_participant_name"
                  name="participant_name"
                  type="text"
                  value={form.participant_name}
                  onChange={handleChange}
                  className={`form-input ${errors.participant_name ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.participant_name && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.participant_name}</p>
                )}
              </div>

              {/* Program Name */}
              <div>
                <label htmlFor="edit_program_name" className="form-label">
                  Program / Course Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="edit_program_name"
                  name="program_name"
                  type="text"
                  value={form.program_name}
                  onChange={handleChange}
                  className={`form-input ${errors.program_name ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.program_name && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.program_name}</p>
                )}
              </div>

              {/* Rating Star Picker */}
              <div>
                <label className="form-label">
                  Rating <span className="text-red-400">*</span>
                </label>
                <StarPicker value={form.rating} onChange={handleRatingChange} />
                {errors.rating && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.rating}</p>
                )}
              </div>

              {/* Comments */}
              <div>
                <label htmlFor="edit_comments" className="form-label">
                  Comments <span className="text-gray-600 font-normal">(optional)</span>
                </label>
                <textarea
                  id="edit_comments"
                  name="comments"
                  rows={4}
                  value={form.comments}
                  onChange={handleChange}
                  placeholder="Update your comments..."
                  className="form-input resize-none"
                  maxLength={1000}
                />
                <p className="mt-1 text-xs text-gray-600 text-right">
                  {form.comments.length}/1000
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  id="save-feedback-btn"
                  disabled={submitting}
                  className="btn-primary flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/feedback/${id}`)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default EditFeedback;
