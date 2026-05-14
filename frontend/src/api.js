/**
 * src/api.js
 * ----------
 * Central Axios instance — the single source of truth for all HTTP calls.
 *
 * Why a central instance?
 *   - Set the base URL once (not in every component)
 *   - Add request/response interceptors in one place
 *   - Easy to swap the backend URL for production
 */

import axios from 'axios';

// -------------------------------------------------------------------
// Create the Axios instance
// baseURL points to the FastAPI backend.
// Because vite.config.js proxies /api → http://localhost:8000,
// we can use a relative URL here (works for both dev and prod builds).
// -------------------------------------------------------------------
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',  // FastAPI backend
  timeout: 10000,                           // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// -------------------------------------------------------------------
// Request Interceptor
// Runs BEFORE every outgoing request.
// Useful for attaching auth tokens later (Phase 3).
// -------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    // Log outgoing requests in development mode
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data ?? '');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -------------------------------------------------------------------
// Response Interceptor
// Runs AFTER every response (success or error).
// Centralises error parsing so components don't need to handle raw axios errors.
// -------------------------------------------------------------------
api.interceptors.response.use(
  // Success: just return the response as-is
  (response) => response,

  // Error: extract a human-readable message and re-throw
  (error) => {
    const message =
      error.response?.data?.detail ||          // FastAPI HTTPException detail
      error.response?.data?.message ||         // custom message field
      error.message ||                          // axios network error
      'Something went wrong. Please try again.';

    // Attach the clean message to the error so components can use it directly
    error.userMessage = message;

    if (import.meta.env.DEV) {
      console.error('[API Error]', error.response?.status, message);
    }

    return Promise.reject(error);
  }
);

export default api;
