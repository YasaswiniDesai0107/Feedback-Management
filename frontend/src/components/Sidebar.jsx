/**
 * src/components/Sidebar.jsx
 * ---------------------------
 * Left-side navigation panel with route links and active state highlighting.
 * Collapses to a hamburger on mobile.
 *
 * Props:
 *   isOpen    (boolean)  — controls visibility on mobile
 *   onClose   (function) — closes the mobile sidebar
 */

import { NavLink } from 'react-router-dom';

// Navigation items — easy to extend in future phases
const navItems = [
  { to: '/',           label: 'Dashboard',       icon: '📊' },
  { to: '/feedbacks',  label: 'All Feedbacks',   icon: '📋' },
  { to: '/submit',     label: 'Submit Feedback',  icon: '✍️'  },
];

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-30 w-64
          bg-gray-950 border-r border-gray-800
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Brand / Logo area */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
            💬
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">FeedbackMS</p>
            <p className="text-xs text-gray-500 leading-tight">Management System</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-3 mb-3">
            Navigation
          </p>

          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}    // 'end' prevents Dashboard matching all routes
              onClick={onClose}   // close sidebar on mobile after navigation
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                 ${isActive
                   ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                   : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                 }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer tag */}
        <div className="px-6 py-4 border-t border-gray-800">
          <p className="text-xs text-gray-600 text-center">Phase 2 — v1.0.0</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
