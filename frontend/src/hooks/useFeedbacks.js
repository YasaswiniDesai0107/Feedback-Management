/**
 * src/hooks/useFeedbacks.js
 * --------------------------
 * Custom React hook that manages all feedback data + loading/error states.
 *
 * Why a custom hook?
 *   - Reuse the same data-fetching logic across multiple pages
 *   - Keep components clean — no useState/useEffect boilerplate in JSX
 *   - Single place to manage loading and error states
 *
 * Usage example:
 *   const { feedbacks, loading, error, refetch, deleteFeedbackById } = useFeedbacks();
 */

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getAllFeedbacks, deleteFeedback } from '../services/feedbackService';

const useFeedbacks = () => {
  // ------- State -------
  const [feedbacks, setFeedbacks] = useState([]);   // array of feedback records
  const [loading, setLoading]     = useState(true); // true while fetching
  const [error, setError]         = useState(null); // error message string or null

  // ------- Fetch all feedbacks -------
  // useCallback ensures this function reference is stable (doesn't re-create on every render)
  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllFeedbacks();
      setFeedbacks(data);
    } catch (err) {
      const message = err.userMessage || 'Failed to load feedbacks.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount (when the component using this hook first renders)
  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  // ------- Delete a feedback -------
  // Optimistic UI: remove from state immediately, then call API
  const deleteFeedbackById = async (id) => {
    // Show a confirmation-style loading toast
    const toastId = toast.loading('Deleting feedback...');
    try {
      await deleteFeedback(id);
      // Remove from local state so the UI updates instantly (no need to refetch)
      setFeedbacks((prev) => prev.filter((fb) => fb.feedback_id !== id));
      toast.success('Feedback deleted successfully.', { id: toastId });
    } catch (err) {
      toast.error(err.userMessage || 'Failed to delete feedback.', { id: toastId });
    }
  };

  return {
    feedbacks,          // array of all feedbacks
    loading,            // boolean — is data loading?
    error,              // string or null
    refetch: fetchFeedbacks,      // call to manually re-fetch
    deleteFeedbackById, // call with an ID to delete
  };
};

export default useFeedbacks;
