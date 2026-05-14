/**
 * src/components/RatingStars.jsx
 * --------------------------------
 * Displays a star rating (1–5) visually.
 * Read-only — for display purposes, not input.
 *
 * Props:
 *   rating (number) — the rating value (1 to 5)
 *   size   (string) — 'sm' | 'md' | 'lg'
 */

const sizeMap = {
  sm: 'text-sm',
  md: 'text-xl',
  lg: 'text-2xl',
};

const RatingStars = ({ rating, size = 'md' }) => {
  return (
    <div
      className={`flex items-center gap-0.5 ${sizeMap[size]}`}
      aria-label={`Rating: ${rating} out of 5`}
      title={`${rating}/5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? 'text-amber-400' : 'text-gray-700'}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default RatingStars;
