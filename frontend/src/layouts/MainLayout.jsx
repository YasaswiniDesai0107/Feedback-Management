/**
 * src/layouts/MainLayout.jsx
 * ---------------------------
 * The shared layout wrapper used by all pages.
 * Composes: Sidebar + Navbar + page content area.
 *
 * Structure:
 *   ┌─────────────────────────────┐
 *   │  Sidebar  │  Navbar         │
 *   │           │─────────────────│
 *   │           │  Page Content   │
 *   │           │  (children)     │
 *   └─────────────────────────────┘
 *
 * Props:
 *   children (ReactNode) — the page component to render in the content area
 *   title    (string)    — current page title shown in Navbar
 */

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const MainLayout = ({ children, title }) => {
  // Controls mobile sidebar open/close
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    // Full-height flex container: sidebar on left, main content on right
    <div className="flex h-screen overflow-hidden bg-gray-950">

      {/* Left Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Right: Navbar + scrollable page content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          onMenuClick={() => setSidebarOpen((prev) => !prev)}
          title={title}
        />

        {/* Page Content — scrollable area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
