'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://k5kutx396j.us-east-1.awsapprunner.com/api';

interface SakeItem {
  id: number;
  name: string;
  brewery_id: number;
  brewery_name: string;
  brewery_prefecture: string;
  tokutei_meisho: string;
  description?: string;
  created_at: string;
}

interface DuplicateGroup {
  name: string;
  count: number;
  sakes: SakeItem[];
}

export default function DuplicatesPage() {
  const router = useRouter();
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'count'>('count');

  useEffect(() => {
    fetchDuplicates();
  }, []);

  const fetchDuplicates = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/sakes/duplicates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('重複データの取得に失敗しました');
      }

      const data = await response.json();
      setDuplicates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '重複データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (name: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(name)) {
      newExpanded.delete(name);
    } else {
      newExpanded.add(name);
    }
    setExpandedGroups(newExpanded);
  };

  const expandAll = () => {
    setExpandedGroups(new Set(duplicates.map(d => d.name)));
  };

  const collapseAll = () => {
    setExpandedGroups(new Set());
  };

  const filteredAndSortedDuplicates = duplicates
    .filter((group) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const nameMatch = group.name.toLowerCase().includes(query);
      const breweryMatch = group.sakes.some(sake => 
        sake.brewery_name.toLowerCase().includes(query)
      );
      const prefectureMatch = group.sakes.some(sake => 
        sake.brewery_prefecture.toLowerCase().includes(query)
      );
      return nameMatch || breweryMatch || prefectureMatch;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name, 'ja');
      } else if (sortOrder === 'desc') {
        return b.name.localeCompare(a.name, 'ja');
      } else {
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return a.name.localeCompare(b.name, 'ja');
      }
    });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">重複する日本酒名</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/sakes')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            日本酒一覧に戻る
          </button>
          {duplicates.length > 0 && (
            <>
              <button
                onClick={expandAll}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                全て展開
              </button>
              <button
                onClick={collapseAll}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                全て折りたたむ
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {duplicates.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-8">
          <p className="text-center text-gray-600 text-lg">
            重複する日本酒名はありません
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="日本酒名、醸造所、都道府県で検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortOrder('count')}
                    className={`px-4 py-2 rounded-md ${
                      sortOrder === 'count'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    重複数順
                  </button>
                  <button
                    onClick={() => setSortOrder('asc')}
                    className={`px-4 py-2 rounded-md ${
                      sortOrder === 'asc'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    名前順 ↑
                  </button>
                  <button
                    onClick={() => setSortOrder('desc')}
                    className={`px-4 py-2 rounded-md ${
                      sortOrder === 'desc'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    名前順 ↓
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {filteredAndSortedDuplicates.length !== duplicates.length ? (
                  <>
                    {filteredAndSortedDuplicates.length}グループ表示中（全{duplicates.length}グループ）
                  </>
                ) : (
                  <>同じ名前を持つ日本酒が{duplicates.length}グループ見つかりました</>
                )}
              </div>
            </div>
          </div>

          {filteredAndSortedDuplicates.map((group) => (
            <div key={group.name} className="bg-white shadow-md rounded-lg overflow-hidden">
              <div
                className="bg-gray-50 px-6 py-4 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                onClick={() => toggleGroup(group.name)}
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl">
                    {expandedGroups.has(group.name) ? '▼' : '▶'}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{group.name}</h2>
                    <p className="text-sm text-gray-600">
                      {group.count}件の重複
                    </p>
                  </div>
                </div>
              </div>

              {expandedGroups.has(group.name) && (
                <div className="p-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">醸造所</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">都道府県</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">特定名称</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">説明</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">作成日</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {group.sakes.map((sake) => (
                        <tr key={sake.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{sake.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{sake.brewery_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <span className={sake.brewery_prefecture === '不明' ? 'text-yellow-600' : ''}>
                              {sake.brewery_prefecture}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{sake.tokutei_meisho}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                            {sake.description || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(sake.created_at).toLocaleDateString('ja-JP')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
