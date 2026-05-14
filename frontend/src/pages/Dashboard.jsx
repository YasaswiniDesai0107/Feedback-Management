/**
 * src/pages/Dashboard.jsx
 * ------------------------
 * The main dashboard page showing:
 *   - Key statistics (total count, average rating, high/low ratings)
 *   - Recent 5 feedback submissions
 *
 * Data flow:
 *   useFeedbacks hook → getAllFeedbacks API → FastAPI GET /api/v1/feedback/
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import StatCard from '../components/StatCard';
import RatingStars from '../components/RatingStars';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import useFeedbacks from '../hooks/useFeedbacks';

// Format date helper
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

const Dashboard = () => {
  const navigate = useNavigate();
  const { feedbacks, loading, error } = useFeedbacks();

  // Compute derived statistics from the feedbacks array
  const stats = useMemo(() => {
    if (!feedbacks.length) return null;

    const total = feedbacks.length;
    const avgRating = (feedbacks.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(1);
    const highRated = feedbacks.filter((f) => f.rating >= 4).length;
    const lowRated  = feedbacks.filter((f) => f.rating <= 2).length;

    return { total, avgRating, highRated, lowRated };
  }, [feedbacks]);

  // The 5 most recent feedbacks (API already returns them sorted by desc submitted_at)
  const recentFeedbacks = feedbacks.slice(0, 5);

  return (
    <MainLayout title="Dashboard">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">

        {/* ── Page heading ── */}
        <div>
          <h2 className="page-title">Welcome Back 👋</h2>
          <p className="text-gray-400 text-sm mt-1">
            Here's an overview of all feedback submissions.
          </p>
        </div>

        {/* ── Loading state ── */}
        {loading && <LoadingSpinner message="Loading dashboard..." />}

        {/* ── Error state ── */}
        {!loading && error && (
          <div className="card p-6 text-center border-red-500/20">
            <p className="text-red-400 font-medium">⚠️ {error}</p>
            <p className="text-gray-500 text-sm mt-1">Make sure the backend is running on port 8000.</p>
          </div>
        )}

        {/* ── Stats grid ── */}
        {!loading && !error && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="Total Feedbacks"
              value={stats.total}
              icon="📝"
              color="blue"
              subtitle="All time submissions"
            />
            <StatCard
              title="Average Rating"
              value={`${stats.avgRating} / 5`}
              icon="⭐"
              color="amber"
              subtitle="Across all programs"
            />
            <StatCard
              title="High Rated (4-5★)"
              value={stats.highRated}
              icon="🏆"
              color="emerald"
              subtitle="Satisfied participants"
            />
            <StatCard
              title="Low Rated (1-2★)"
              value={stats.lowRated}
              icon="⚠️"
              color="rose"
              subtitle="Needs improvement"
            />
          </div>
        )}

        {/* ── Empty state (no feedbacks yet) ── */}
        {!loading && !error && feedbacks.length === 0 && (
          <EmptyState
            icon="📭"
            title="No feedbacks yet"
            message="Submit the first feedback to see dashboard statistics here."
            action={
              <button
                onClick={() => navigate('/submit')}
                className="btn-primary"
              >
                Submit First Feedback
              </button>
            }
          />
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

            {/* Table */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Participant</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Program</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {recentFeedbacks.map((fb) => (
                      <tr
                        key={fb.feedback_id}
                        className="hover:bg-gray-800/40 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-medium text-white">{fb.participant_name}</td>
                        <td className="px-5 py-3.5 text-gray-400 max-w-[160px] truncate">{fb.program_name}</td>
                        <td className="px-5 py-3.5">
                          <RatingStars rating={fb.rating} size="sm" />
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
