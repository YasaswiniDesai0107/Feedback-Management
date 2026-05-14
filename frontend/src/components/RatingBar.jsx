/**
 * src/components/RatingBar.jsx
 * -----------------------------
 * Horizontal progress bar visualizing rating distribution.
 * Used in the Dashboard to show how many feedbacks got each star rating.
 *
 * Props:
 *   feedbacks (array) — all feedback records (to compute distribution)
 */

const RatingBar = ({ feedbacks }) => {
  if (!feedbacks || feedbacks.length === 0) return null;

  // Count feedbacks at each rating level (1–5)
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  feedbacks.forEach((fb) => {
    if (counts[fb.rating] !== undefined) counts[fb.rating]++;
  });

  const total = feedbacks.length;

  // Color for each rating level
  const colors = {
    5: 'bg-emerald-500',
    4: 'bg-green-500',
    3: 'bg-amber-500',
    2: 'bg-orange-500',
    1: 'bg-rose-500',
  };

  const labels = {
    5: 'Excellent',
    4: 'Great',
    3: 'Good',
    2: 'Fair',
    1: 'Poor',
  };

  return (
    <div className="card p-5 space-y-3">
      <h3 className="text-sm font-semibold text-white mb-4">Rating Distribution</h3>

      {/* Render bars from 5★ down to 1★ */}
      {[5, 4, 3, 2, 1].map((star) => {
        const count = counts[star];
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;

        return (
          <div key={star} className="flex items-center gap-3">
            {/* Star label */}
            <div className="w-14 flex items-center gap-1 flex-shrink-0">
              <span className="text-amber-400 text-sm">{'★'.repeat(star)}</span>
            </div>

            {/* Progress bar track */}
            <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${colors[star]}`}
                style={{ width: `${pct}%` }}
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${labels[star]}: ${pct}%`}
              />
            </div>

            {/* Count + percent */}
            <div className="w-20 text-right flex-shrink-0">
              <span className="text-xs text-gray-400">
                {count} <span className="text-gray-600">({pct}%)</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RatingBar;
