/**
 * src/utils/helpers.js
 * --------------------
 * Pure utility functions shared across the application.
 * No React imports — plain JavaScript functions only.
 *
 * Includes:
 *   formatDate()        — human-readable date string
 *   formatDateTime()    — full date + time string
 *   getRatingLabel()    — convert numeric rating to text label
 *   getRatingColor()    — Tailwind color classes by rating
 *   exportToCSV()       — download feedback data as a .csv file
 *   debounce()          — delay function execution for search inputs
 */

// -------------------------------------------------------------------
// Date formatting
// -------------------------------------------------------------------

/**
 * Format an ISO timestamp to a short readable date.
 * e.g. "12 May 2026"
 */
export const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format an ISO timestamp to full date + time.
 * e.g. "Thursday, 12 May 2026, 10:30 AM"
 */
export const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// -------------------------------------------------------------------
// Rating helpers
// -------------------------------------------------------------------

/** Maps a numeric rating (1–5) to a descriptive text label */
export const getRatingLabel = (rating) => {
  const labels = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent' };
  return labels[rating] || 'Unknown';
};

/**
 * Returns Tailwind class sets for a rating value.
 * Usage: const { text, bg, border } = getRatingColor(feedback.rating)
 */
export const getRatingColor = (rating) => {
  if (rating >= 4) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
  if (rating === 3) return { text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20'   };
  return               { text: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20'    };
};

// -------------------------------------------------------------------
// CSV Export (Bonus feature)
// -------------------------------------------------------------------

/**
 * Convert an array of feedback objects to CSV and trigger a download.
 *
 * @param {Array}  feedbacks - Array of feedback records
 * @param {string} filename  - Name for the downloaded file
 */
export const exportToCSV = (feedbacks, filename = 'feedbacks_export.csv') => {
  if (!feedbacks || feedbacks.length === 0) {
    alert('No data to export.');
    return;
  }

  // Define the CSV columns in display order
  const columns = [
    { key: 'feedback_id',     label: 'ID'               },
    { key: 'participant_name', label: 'Participant Name'  },
    { key: 'program_name',    label: 'Program Name'      },
    { key: 'rating',          label: 'Rating'            },
    { key: 'comments',        label: 'Comments'          },
    { key: 'submitted_at',    label: 'Submitted At'      },
  ];

  // Build header row
  const header = columns.map((c) => `"${c.label}"`).join(',');

  // Build data rows — wrap each value in quotes and escape internal quotes
  const rows = feedbacks.map((fb) =>
    columns
      .map((c) => {
        const val = fb[c.key] ?? '';
        // Escape double quotes by doubling them (CSV standard)
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  // Combine header + rows
  const csvContent = [header, ...rows].join('\n');

  // Create a Blob and trigger browser download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);  // free memory
};

// -------------------------------------------------------------------
// Debounce utility (for search input)
// -------------------------------------------------------------------

/**
 * Returns a debounced version of the given function.
 * The function only fires after `delay` ms of inactivity.
 *
 * Usage:
 *   const debouncedSearch = debounce((q) => fetchResults(q), 400);
 *   <input onChange={(e) => debouncedSearch(e.target.value)} />
 *
 * @param {Function} fn    - The function to debounce
 * @param {number}   delay - Milliseconds to wait (default 400ms)
 */
export const debounce = (fn, delay = 400) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
