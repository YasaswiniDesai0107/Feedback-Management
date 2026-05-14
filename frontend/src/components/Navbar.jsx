/**
 * src/components/Navbar.jsx
 * --------------------------
 * Top navigation bar — shows current page title and the hamburger menu on mobile.
 *
 * Props:
 *   onMenuClick (function) — toggles the mobile sidebar
 *   title       (string)   — current page name shown in the header
 */

import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuClick, title = 'Dashboard' }) => {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-10">
      {/* Hamburger — only visible on mobile */}
      <button
        id="mobile-menu-btn"
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        aria-label="Open navigation menu"
      >
        {/* Three lines icon */}
        <div className="space-y-1.5">
          <span className="block w-5 h-0.5 bg-current" />
          <span className="block w-5 h-0.5 bg-current" />
          <span className="block w-5 h-0.5 bg-current" />
        </div>
      </button>

      {/* Page title */}
      <h1 className="text-base font-semibold text-white flex-1 truncate">{title}</h1>

      {/* Right-side actions */}
      <div className="flex items-center gap-3">
        {/* Quick submit button */}
        <button
          id="quick-submit-btn"
          onClick={() => navigate('/submit')}
          className="hidden sm:flex items-center gap-2 text-xs font-semibold
                     bg-blue-600 hover:bg-blue-500 text-white
                     px-4 py-2 rounded-lg transition-colors"
        >
          <span>+</span> New Feedback
        </button>

        {/* Status indicator — shows backend is running */}
        <div
          className="flex items-center gap-1.5 text-xs text-gray-500"
          title="API Status: Connected"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">Connected</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
