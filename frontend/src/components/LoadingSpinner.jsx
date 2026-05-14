/**
 * src/components/LoadingSpinner.jsx
 * ----------------------------------
 * A centered animated spinner used during data-fetching states.
 *
 * Props:
 *   message (string) — optional label shown below the spinner
 *   size    (string) — 'sm' | 'md' | 'lg'
 */

const sizeMap = {
  sm: 'h-6 w-6 border-2',
  md: 'h-10 w-10 border-3',
  lg: 'h-16 w-16 border-4',
};

const LoadingSpinner = ({ message = 'Loading...', size = 'md' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
      {/* Spinning ring */}
      <div
        className={`${sizeMap[size]} rounded-full border-gray-700 border-t-blue-500 animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {/* Optional label */}
      {message && (
        <p className="text-gray-400 text-sm font-medium">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
