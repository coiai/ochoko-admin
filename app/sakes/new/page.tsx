'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { apiClient } from '@/lib/api/client';
import { SakeCreate, Brewery } from '@/lib/types';
import { Navbar } from '@/components/Navbar';

const TOKUTEI_MEISHO_OPTIONS = [
  { value: '', label: '特定名称を選択してください' },
  { value: 'junmai_daiginjo', label: '純米大吟醸' },
  { value: 'daiginjo', label: '大吟醸' },
  { value: 'junmai_ginjo', label: '純米吟醸' },
  { value: 'ginjo', label: '吟醸' },
  { value: 'tokubetsu_junmai', label: '特別純米' },
  { value: 'junmai', label: '純米' },
  { value: 'tokubetsu_honjozo', label: '特別本醸造' },
  { value: 'honjozo', label: '本醸造' },
  { value: 'futsushu', label: '普通酒' },
];

const HIIRE_TYPE_OPTIONS = [
  { value: '', label: '選択してください' },
  { value: 'hiire', label: '火入れ' },
  { value: 'nama', label: '生酒' },
  { value: 'namazume', label: '生詰' },
  { value: 'namachozo', label: '生貯蔵' },
];

const FILTRATION_TYPE_OPTIONS = [
  { value: '', label: '選択してください' },
  { value: 'filtered', label: '濾過' },
  { value: 'muroka', label: '無濾過' },
  { value: 'nigori', label: 'にごり' },
  { value: 'genshu', label: '原酒' },
];

export default function NewSakePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [breweries, setBreweries] = useState<Brewery[]>([]);
  const [formData, setFormData] = useState<SakeCreate>({
    name: '',
    brewery_name: '',
    tokutei_meisho: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBreweries();
    }
  }, [isAuthenticated]);

  const fetchBreweries = async () => {
    try {
      const data = await apiClient.getBreweries();
      setBreweries(data);
    } catch (err) {
      console.error('Failed to fetch breweries:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.createSake(formData);
      router.push('/sakes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sake');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof SakeCreate, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">新しい日本酒を投稿</h1>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6 space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  日本酒名 *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="例: 獺祭 純米大吟醸 磨き二割三分"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="brewery_name" className="block text-sm font-medium text-gray-700">
                  酒蔵名 *
                </label>
                <input
                  type="text"
                  id="brewery_name"
                  required
                  value={formData.brewery_name}
                  onChange={(e) => updateFormData('brewery_name', e.target.value)}
                  placeholder="酒蔵名を入力してください"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="tokutei_meisho" className="block text-sm font-medium text-gray-700">
                  特定名称 *
                </label>
                <select
                  id="tokutei_meisho"
                  required
                  value={formData.tokutei_meisho}
                  onChange={(e) => updateFormData('tokutei_meisho', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {TOKUTEI_MEISHO_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="rice_variety" className="block text-sm font-medium text-gray-700">
                  原料米
                </label>
                <input
                  type="text"
                  id="rice_variety"
                  value={formData.rice_variety || ''}
                  onChange={(e) => updateFormData('rice_variety', e.target.value)}
                  placeholder="例: 山田錦"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="yeast" className="block text-sm font-medium text-gray-700">
                  酵母
                </label>
                <input
                  type="text"
                  id="yeast"
                  value={formData.yeast || ''}
                  onChange={(e) => updateFormData('yeast', e.target.value)}
                  placeholder="例: 協会9号"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="seimaibuai" className="block text-sm font-medium text-gray-700">
                    精米歩合 (%)
                  </label>
                  <input
                    type="number"
                    id="seimaibuai"
                    value={formData.seimaibuai || ''}
                    onChange={(e) => updateFormData('seimaibuai', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="例: 23"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="alcohol_content" className="block text-sm font-medium text-gray-700">
                    アルコール度数 (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="alcohol_content"
                    value={formData.alcohol_content || ''}
                    onChange={(e) => updateFormData('alcohol_content', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="例: 16.0"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nihonshudo" className="block text-sm font-medium text-gray-700">
                    日本酒度
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="nihonshudo"
                    value={formData.nihonshudo || ''}
                    onChange={(e) => updateFormData('nihonshudo', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="例: +3.0"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="acidity" className="block text-sm font-medium text-gray-700">
                    酸度
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="acidity"
                    value={formData.acidity || ''}
                    onChange={(e) => updateFormData('acidity', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="例: 1.3"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="hiire_type" className="block text-sm font-medium text-gray-700">
                  火入れ
                </label>
                <select
                  id="hiire_type"
                  value={formData.hiire_type || ''}
                  onChange={(e) => updateFormData('hiire_type', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {HIIRE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filtration_type" className="block text-sm font-medium text-gray-700">
                  濾過
                </label>
                <select
                  id="filtration_type"
                  value={formData.filtration_type || ''}
                  onChange={(e) => updateFormData('filtration_type', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {FILTRATION_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  説明
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description || ''}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="この日本酒の特徴や味わいについて..."
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                  画像URL
                </label>
                <input
                  type="url"
                  id="image"
                  value={formData.image || ''}
                  onChange={(e) => updateFormData('image', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 space-x-3">
              <button
                type="button"
                onClick={() => router.push('/sakes')}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? '投稿中...' : '投稿する'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
