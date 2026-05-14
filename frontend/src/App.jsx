/**
 * src/App.jsx
 * ------------
 * The root application component.
 * Sets up React Router with all page routes and the toast notification system.
 *
 * Route Map:
 *   /                    → Dashboard
 *   /feedbacks           → FeedbackList (all feedback cards)
 *   /submit              → SubmitFeedback (create form)
 *   /feedback/:id        → FeedbackDetails (single record view)
 *   /feedback/:id/edit   → EditFeedback (update form)
 *   *                    → 404 Not Found (fallback)
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Page imports
import Dashboard       from './pages/Dashboard';
import FeedbackList    from './pages/FeedbackList';
import SubmitFeedback  from './pages/SubmitFeedback';
import FeedbackDetails from './pages/FeedbackDetails';
import EditFeedback    from './pages/EditFeedback';

const App = () => {
  return (
    // BrowserRouter enables HTML5 history-based routing
    <BrowserRouter>
      {/* ────────────────────────────────────────
          Toast Notification System
          react-hot-toast renders toasts in a portal
          above everything else in the DOM.
      ──────────────────────────────────────── */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1e293b',       // dark surface
            color: '#f1f5f9',            // light text
            border: '1px solid #334155', // subtle border
            borderRadius: '10px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',   // green checkmark
              secondary: '#1e293b',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',   // red x
              secondary: '#1e293b',
            },
          },
        }}
      />

      {/* ────────────────────────────────────────
          Application Routes
      ──────────────────────────────────────── */}
      <Routes>
        {/* Dashboard — home page */}
        <Route path="/"                       element={<Dashboard />}       />

        {/* All feedbacks list */}
        <Route path="/feedbacks"              element={<FeedbackList />}    />

        {/* Submit new feedback */}
        <Route path="/submit"                 element={<SubmitFeedback />}  />

        {/* Single feedback details — :id is dynamic */}
        <Route path="/feedback/:id"           element={<FeedbackDetails />} />

        {/* Edit existing feedback */}
        <Route path="/feedback/:id/edit"      element={<EditFeedback />}    />

        {/* Catch-all: redirect unknown routes to dashboard */}
        <Route path="*"                       element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
