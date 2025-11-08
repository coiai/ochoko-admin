'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { apiClient } from '@/lib/api/client';
import { Sake } from '@/lib/types';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

export default function SakesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sakes, setSakes] = useState<Sake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSakes();
    }
  }, [isAuthenticated]);

  const fetchSakes = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getSakes();
      setSakes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sakes');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">日本酒管理</h1>
            <Link
              href="/sakes/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              新規投稿
            </Link>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">読み込み中...</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {sakes.map((sake) => (
                  <li key={sake.id}>
                    <Link
                      href={`/sakes/${sake.id}`}
                      className="block hover:bg-gray-50 transition"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-lg font-medium text-indigo-600 truncate">
                              {sake.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {sake.brewery_name} ({sake.brewery_prefecture})
                            </p>
                          </div>
                          <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {sake.tokutei_meisho}
                            </span>
                            {sake.average_rating && (
                              <span className="text-sm text-gray-500">
                                ★ {sake.average_rating.toFixed(1)} ({sake.review_count})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
