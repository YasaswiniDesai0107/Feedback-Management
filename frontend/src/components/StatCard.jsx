/**
 * src/components/StatCard.jsx
 * ----------------------------
 * Dashboard metric card.
 * Displays a label, a large value, and an optional icon + trend indicator.
 *
 * Props:
 *   title    (string)    — metric label e.g. "Total Feedbacks"
 *   value    (string|number) — the prominent number/text
 *   icon     (string)    — emoji icon
 *   color    (string)    — tailwind color accent: 'blue' | 'emerald' | 'amber' | 'violet'
 *   subtitle (string)    — optional small caption below value
 */

// Maps color names to Tailwind classes
const colorMap = {
  blue:    { bg: 'bg-blue-500/10',    icon: 'bg-blue-500/20 text-blue-400',    text: 'text-blue-400'   },
  emerald: { bg: 'bg-emerald-500/10', icon: 'bg-emerald-500/20 text-emerald-400', text: 'text-emerald-400' },
  amber:   { bg: 'bg-amber-500/10',   icon: 'bg-amber-500/20 text-amber-400',  text: 'text-amber-400'  },
  violet:  { bg: 'bg-violet-500/10',  icon: 'bg-violet-500/20 text-violet-400', text: 'text-violet-400' },
  rose:    { bg: 'bg-rose-500/10',    icon: 'bg-rose-500/20 text-rose-400',    text: 'text-rose-400'   },
};

const StatCard = ({ title, value, icon, color = 'blue', subtitle }) => {
  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className={`card p-6 flex items-start gap-4 hover:border-gray-700 transition-all duration-200 animate-slide-up`}>
      {/* Icon bubble */}
      <div className={`${colors.icon} rounded-xl p-3 text-2xl flex-shrink-0`}>
        {icon}
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-400 truncate">{title}</p>
        <p className={`text-3xl font-bold mt-1 ${colors.text}`}>{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
