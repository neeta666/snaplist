import { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/dashboardService';
import { extractApiError } from '../lib/apiErrors';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      setIsLoading(true);
      setError('');
      try {
        const result = await getDashboardStats();
        if (isMounted) setStats(result);
      } catch (err) {
        const { message } = extractApiError(err);
        if (isMounted) setError(message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-md border border-gray-200 p-4">
          <span className="block text-sm text-gray-500">Total</span>
          <span className="text-2xl font-semibold text-gray-900">{stats.totalListings}</span>
        </div>
        <div className="rounded-md border border-gray-200 p-4">
          <span className="block text-sm text-gray-500">Draft</span>
          <span className="text-2xl font-semibold text-gray-900">{stats.draftListings}</span>
        </div>
        <div className="rounded-md border border-gray-200 p-4">
          <span className="block text-sm text-gray-500">Active</span>
          <span className="text-2xl font-semibold text-gray-900">{stats.activeListings}</span>
        </div>
        <div className="rounded-md border border-gray-200 p-4">
          <span className="block text-sm text-gray-500">Sold</span>
          <span className="text-2xl font-semibold text-gray-900">{stats.soldListings}</span>
        </div>
      </div>

      {stats.byCategory.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-gray-700">By category</h2>
          <div className="mt-2 space-y-2">
            {stats.byCategory.map((entry) => (
              <div
                key={entry.category}
                className="flex justify-between rounded-md border border-gray-200 px-3 py-2 text-sm"
              >
                <span className="text-gray-700">{entry.category}</span>
                <span className="font-medium text-gray-900">{entry.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}