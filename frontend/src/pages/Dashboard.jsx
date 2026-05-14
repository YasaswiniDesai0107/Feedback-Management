/**
 * src/pages/Dashboard.jsx  (Step 3 — updated)
 * ---------------------------------------------
 * Enhanced dashboard with:
 *   - Rating distribution visualization (RatingBar)
 *   - Program leaderboard (top 5 programs by avg rating)
 *   - Improved stat cards with better metrics
 *   - Recent feedbacks table (unchanged from Step 2)
 *
 * All data is derived client-side from the single GET /feedback/ call.
 * No additional API calls needed for dashboard stats.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import StatCard from '../components/StatCard';
import RatingStars from '../components/RatingStars';
import RatingBar from '../components/RatingBar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import useFeedbacks from '../hooks/useFeedbacks';
import { formatDate, getRatingLabel } from '../utils/helpers';

const Dashboard = () => {
  const navigate = useNavigate();
  const { feedbacks, loading, error } = useFeedbacks();

  // Compute all dashboard stats from feedbacks array
  const stats = useMemo(() => {
    if (!feedbacks.length) return null;

    const total    = feedbacks.length;
    const avgRating = +(feedbacks.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(1);
    const highRated = feedbacks.filter((f) => f.rating >= 4).length;
    const lowRated  = feedbacks.filter((f) => f.rating <= 2).length;

    // Unique programs
    const uniquePrograms = [...new Set(feedbacks.map((f) => f.program_name))].length;

    // Top program by count
    const programCounts = {};
    feedbacks.forEach((f) => {
      programCounts[f.program_name] = (programCounts[f.program_name] || 0) + 1;
    });

    // Per-program average rating (for leaderboard)
    const programRatings = {};
    feedbacks.forEach((f) => {
      if (!programRatings[f.program_name]) {
        programRatings[f.program_name] = { sum: 0, count: 0 };
      }
      programRatings[f.program_name].sum   += f.rating;
      programRatings[f.program_name].count += 1;
    });

    const programLeaderboard = Object.entries(programRatings)
      .map(([name, { sum, count }]) => ({
        name,
        avg: +(sum / count).toFixed(1),
        count,
      }))
      .sort((a, b) => b.avg - a.avg || b.count - a.count)
      .slice(0, 5);

    return { total, avgRating, highRated, lowRated, uniquePrograms, programLeaderboard };
  }, [feedbacks]);

  const recentFeedbacks = feedbacks.slice(0, 5);

  return (
    <MainLayout title="Dashboard">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">

        {/* ── Page heading ── */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="page-title">Dashboard</h2>
            <p className="text-gray-400 text-sm mt-1">
              Overview of all feedback submissions and program performance.
            </p>
          </div>
          <button
            onClick={() => navigate('/submit')}
            className="btn-primary text-sm hidden sm:block"
          >
            + New Feedback
          </button>
        </div>

        {/* ── Loading ── */}
        {loading && <LoadingSpinner message="Loading dashboard..." />}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="card p-6 text-center border-red-500/20">
            <p className="text-red-400 font-medium">⚠️ {error}</p>
            <p className="text-gray-500 text-sm mt-1">
              Make sure the backend is running on port 8000.
            </p>
          </div>
        )}

        {/* ── Stats grid ── */}
        {!loading && !error && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            <StatCard title="Total Feedbacks"    value={stats.total}             icon="📝" color="blue"    subtitle="All submissions"         />
            <StatCard title="Average Rating"     value={`${stats.avgRating}★`}  icon="⭐" color="amber"   subtitle={getRatingLabel(Math.round(stats.avgRating))} />
            <StatCard title="High Rated (4–5★)"  value={stats.highRated}         icon="🏆" color="emerald" subtitle="Satisfied participants"   />
            <StatCard title="Low Rated (1–2★)"   value={stats.lowRated}          icon="⚠️" color="rose"    subtitle="Needs improvement"       />
            <StatCard title="Programs Reviewed"  value={stats.uniquePrograms}    icon="🎓" color="violet"  subtitle="Unique programs"         />
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && feedbacks.length === 0 && (
          <EmptyState
            icon="📭"
            title="No feedbacks yet"
            message="Submit the first feedback to see dashboard statistics here."
            action={
              <button onClick={() => navigate('/submit')} className="btn-primary">
                Submit First Feedback
              </button>
            }
          />
        )}

        {/* ── Charts + leaderboard row ── */}
        {!loading && !error && feedbacks.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Rating distribution bar chart */}
            <RatingBar feedbacks={feedbacks} />

            {/* Program leaderboard */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-white mb-4">
                Top Programs by Avg Rating
              </h3>
              <div className="space-y-3">
                {stats?.programLeaderboard.map((prog, idx) => (
                  <div key={prog.name} className="flex items-center gap-3">
                    {/* Rank */}
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                      ${idx === 0 ? 'bg-amber-500/20 text-amber-400'
                      : idx === 1 ? 'bg-gray-400/20 text-gray-400'
                      : idx === 2 ? 'bg-orange-500/20 text-orange-400'
                      : 'bg-gray-800 text-gray-500'}`}>
                      {idx + 1}
                    </span>

                    {/* Program name */}
                    <span className="flex-1 text-sm text-gray-300 truncate min-w-0">
                      {prog.name}
                    </span>

                    {/* Feedback count */}
                    <span className="text-xs text-gray-600 flex-shrink-0">
                      {prog.count} review{prog.count !== 1 ? 's' : ''}
                    </span>

                    {/* Avg rating */}
                    <span className="text-sm font-bold text-amber-400 flex-shrink-0 w-8 text-right">
                      {prog.avg}★
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Recent feedbacks table ── */}
        {!loading && !error && recentFeedbacks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Submissions</h3>
              <button
                onClick={() => navigate('/feedbacks')}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                View all →
              </button>
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {['Participant', 'Program', 'Rating', 'Date', ''].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {recentFeedbacks.map((fb) => (
                      <tr key={fb.feedback_id} className="hover:bg-gray-800/40 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-white">{fb.participant_name}</td>
                        <td className="px-5 py-3.5 text-gray-400 max-w-[160px] truncate">{fb.program_name}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-amber-400 text-sm font-semibold">{fb.rating}★</span>
                          <span className="text-gray-600 text-xs ml-1">{getRatingLabel(fb.rating)}</span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500">{formatDate(fb.submitted_at)}</td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => navigate(`/feedback/${fb.feedback_id}`)}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            View →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

      </div>
    </MainLayout>
  );
};

export default Dashboard;
