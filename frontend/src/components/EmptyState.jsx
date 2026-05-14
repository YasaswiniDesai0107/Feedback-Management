/**
 * src/components/EmptyState.jsx
 * ------------------------------
 * Displayed when a list has no data to show.
 * Replaces the jarring "empty table" experience with a friendly message.
 *
 * Props:
 *   icon    (string)    — emoji or icon character
 *   title   (string)    — bold heading
 *   message (string)    — supporting text
 *   action  (ReactNode) — optional call-to-action button
 */

const EmptyState = ({
  icon = '📭',
  title = 'Nothing here yet',
  message = 'No records found.',
  action = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
      {/* Large icon */}
      <span className="text-6xl select-none" role="img" aria-label={title}>
        {icon}
      </span>

      {/* Heading */}
      <h3 className="text-lg font-semibold text-gray-300">{title}</h3>

      {/* Supporting message */}
      <p className="text-gray-500 text-sm text-center max-w-xs leading-relaxed">
        {message}
      </p>

      {/* Optional action button (e.g., "Submit Feedback") */}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

export default EmptyState;
