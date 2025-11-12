'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://k5kutx396j.us-east-1.awsapprunner.com/api';

interface Brewery {
  id: number;
  name: string;
  location: string;
  prefecture: string;
}

interface Sake {
  id: number;
  name: string;
  brewery: Brewery;
  tokutei_meisho: string;
  description?: string;
}

export default function SakesPage() {
  const router = useRouter();
  const [sakes, setSakes] = useState<Sake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchSakes();
  }, []);

  const fetchSakes = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/sakes/?limit=100`);
      
      if (!response.ok) {
        throw new Error('日本酒データの取得に失敗しました');
      }

      const data = await response.json();
      setSakes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '日本酒データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === sakes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sakes.map(sake => sake.id)));
    }
  };

  const handleSelectOne = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) {
      alert('削除する日本酒を選択してください');
      return;
    }

    if (!confirm(`選択した${selectedIds.size}件の日本酒を削除しますか？この操作は取り消せません。`)) {
      return;
    }

    setDeleting(true);

    try {
      const result = await apiClient.bulkDeleteSakes(Array.from(selectedIds));
      alert(`${result.deleted_count}件の日本酒を削除しました`);
      
      setSelectedIds(new Set());
      fetchSakes();
    } catch (err) {
      if (err instanceof Error && err.message === 'Unauthorized') {
        router.push('/login');
        return;
      }
      setError(err instanceof Error ? err.message : '削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

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
        <h1 className="text-3xl font-bold">日本酒一覧</h1>
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            {selectedIds.size === sakes.length ? '全選択解除' : '全選択'}
          </button>
          {selectedIds.size > 0 && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {deleting ? '削除中...' : `選択した${selectedIds.size}件を削除`}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.size === sakes.length && sakes.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">日本酒名</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">醸造所</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">都道府県</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">特定名称</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">説明</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sakes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  日本酒データがありません
                </td>
              </tr>
            ) : (
              sakes.map((sake) => (
                <tr key={sake.id} className={selectedIds.has(sake.id) ? 'bg-blue-50' : ''}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(sake.id)}
                      onChange={() => handleSelectOne(sake.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{sake.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{sake.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{sake.brewery.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <span className={sake.brewery.prefecture === '不明' ? 'text-yellow-600' : ''}>
                      {sake.brewery.prefecture}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{sake.tokutei_meisho}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                    {sake.description || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        全{sakes.length}件中 {selectedIds.size}件選択
      </div>
    </div>
  );
}
