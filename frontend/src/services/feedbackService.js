/**
 * src/services/feedbackService.js
 * --------------------------------
 * Service layer — all API calls related to the /feedback resource.
 *
 * Why a service layer?
 *   - Components stay clean (no raw axios calls inside JSX)
 *   - Easy to mock for testing
 *   - If the API changes, only this file needs updating
 *
 * Each function returns the `data` portion of the Axios response directly.
 */

import api from '../api';

// ---------------------------------------------------------------
// GET /feedback/
// Fetch all feedback records
// ---------------------------------------------------------------
export const getAllFeedbacks = async () => {
  const response = await api.get('/feedback/');
  return response.data; // returns array of feedback objects
};

// ---------------------------------------------------------------
// GET /feedback/{id}
// Fetch a single feedback record by ID
// ---------------------------------------------------------------
export const getFeedbackById = async (id) => {
  const response = await api.get(`/feedback/${id}`);
  return response.data; // returns single feedback object
};

// ---------------------------------------------------------------
// POST /feedback/
// Submit a new feedback record
// Payload: { participant_name, program_name, rating, comments }
// ---------------------------------------------------------------
export const createFeedback = async (feedbackData) => {
  const response = await api.post('/feedback/', feedbackData);
  return response.data; // returns the created feedback object
};

// ---------------------------------------------------------------
// PUT /feedback/{id}
// Update an existing feedback record (partial update supported)
// Payload: any subset of { participant_name, program_name, rating, comments }
// ---------------------------------------------------------------
export const updateFeedback = async (id, feedbackData) => {
  const response = await api.put(`/feedback/${id}`, feedbackData);
  return response.data; // returns the updated feedback object
};

// ---------------------------------------------------------------
// DELETE /feedback/{id}
// Delete a feedback record by ID
// ---------------------------------------------------------------
export const deleteFeedback = async (id) => {
  const response = await api.delete(`/feedback/${id}`);
  return response.data; // returns confirmation object
};
