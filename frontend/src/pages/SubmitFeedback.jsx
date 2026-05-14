/**
 * src/pages/SubmitFeedback.jsx
 * -----------------------------
 * Form page to submit a new feedback entry.
 *
 * Features:
 *   - Controlled form with React useState
 *   - Client-side validation before submission
 *   - Interactive star-picker for rating
 *   - Axios POST via feedbackService.createFeedback
 *   - Toast notifications for success/error
 *   - Resets form after successful submission
 *
 * API: POST /api/v1/feedback/
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import MainLayout from '../layouts/MainLayout';
import { createFeedback } from '../services/feedbackService';

// Initial empty form state
const INITIAL_FORM = {
  participant_name: '',
  program_name: '',
  rating: 0,          // 0 means "not selected yet"
  comments: '',
};

// Interactive star picker component (used only in this form)
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

const SubmitFeedback = () => {
  const navigate = useNavigate();

  // Form field values
  const [form, setForm]         = useState(INITIAL_FORM);
  // Field-level error messages
  const [errors, setErrors]     = useState({});
  // True while the API call is in flight
  const [submitting, setSubmitting] = useState(false);

  // Generic change handler for text inputs and textarea
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field as the user types
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Called by the StarPicker when a star is clicked
  const handleRatingChange = (rating) => {
    setForm((prev) => ({ ...prev, rating }));
    if (errors.rating) setErrors((prev) => ({ ...prev, rating: '' }));
  };

  // Client-side validation — runs before sending to API
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

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validate
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors before submitting.');
      return;
    }

    // 2. Prepare payload (trim whitespace)
    const payload = {
      participant_name: form.participant_name.trim(),
      program_name:     form.program_name.trim(),
      rating:           form.rating,
      comments:         form.comments.trim() || null, // null if empty
    };

    // 3. Call API
    setSubmitting(true);
    try {
      await createFeedback(payload);
      toast.success('Feedback submitted successfully! 🎉');
      setForm(INITIAL_FORM);   // reset form
      setErrors({});
      // Navigate to the listing page after a short delay
      setTimeout(() => navigate('/feedbacks'), 1200);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout title="Submit Feedback">
      <div className="max-w-2xl mx-auto animate-fade-in">

        {/* Page header */}
        <div className="mb-6">
          <h2 className="page-title">Submit Feedback</h2>
          <p className="text-gray-400 text-sm mt-1">
            Share your experience about a program or course.
          </p>
        </div>

        {/* Form card */}
        <div className="card p-6 lg:p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">

            {/* Participant Name */}
            <div>
              <label htmlFor="participant_name" className="form-label">
                Participant Name <span className="text-red-400">*</span>
              </label>
              <input
                id="participant_name"
                name="participant_name"
                type="text"
                value={form.participant_name}
                onChange={handleChange}
                placeholder="e.g. Alice Johnson"
                className={`form-input ${errors.participant_name ? 'border-red-500 focus:ring-red-500' : ''}`}
                aria-describedby={errors.participant_name ? 'participant_name-error' : undefined}
              />
              {errors.participant_name && (
                <p id="participant_name-error" className="mt-1.5 text-xs text-red-400">
                  {errors.participant_name}
                </p>
              )}
            </div>

            {/* Program Name */}
            <div>
              <label htmlFor="program_name" className="form-label">
                Program / Course Name <span className="text-red-400">*</span>
              </label>
              <input
                id="program_name"
                name="program_name"
                type="text"
                value={form.program_name}
                onChange={handleChange}
                placeholder="e.g. Data Science Bootcamp"
                className={`form-input ${errors.program_name ? 'border-red-500 focus:ring-red-500' : ''}`}
                aria-describedby={errors.program_name ? 'program_name-error' : undefined}
              />
              {errors.program_name && (
                <p id="program_name-error" className="mt-1.5 text-xs text-red-400">
                  {errors.program_name}
                </p>
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

            {/* Comments (optional) */}
            <div>
              <label htmlFor="comments" className="form-label">
                Comments <span className="text-gray-600 font-normal">(optional)</span>
              </label>
              <textarea
                id="comments"
                name="comments"
                rows={4}
                value={form.comments}
                onChange={handleChange}
                placeholder="Share your detailed thoughts, suggestions, or experience..."
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
                id="submit-feedback-btn"
                disabled={submitting}
                className="btn-primary flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Feedback'
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/feedbacks')}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>

        {/* Helper tips */}
        <div className="mt-4 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
          <p className="text-xs text-blue-300 font-medium mb-1">💡 Tips for good feedback</p>
          <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
            <li>Be specific about what worked well and what didn't</li>
            <li>Rate based on your overall experience</li>
            <li>Constructive comments help improve future programs</li>
          </ul>
        </div>

      </div>
    </MainLayout>
  );
};

export default SubmitFeedback;
