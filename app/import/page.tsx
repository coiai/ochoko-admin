'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://k5kutx396j.us-east-1.awsapprunner.com/api';

interface PreviewData {
  brewery_name: string;
  brewery_location: string;
  brewery_prefecture: string;
  sake_name: string;
  sake_kana: string;
}

interface PreviewResponse {
  success: boolean;
  total_rows: number;
  preview: PreviewData[];
  stats: {
    rows_to_process: number;
    rows_to_skip: number;
    breweries_to_create: number;
    sakes_to_create: number;
    sakes_existing: number;
  };
  errors: string[];
  encoding_used: string;
}

interface ImportResponse {
  success: boolean;
  dry_run: boolean;
  stats: {
    rows_processed: number;
    rows_skipped: number;
    breweries_created: number;
    breweries_updated: number;
    breweries_existing: number;
    sakes_created: number;
    sakes_existing: number;
    errors: string[];
  };
  encoding_used: string;
}

export default function ImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [encoding, setEncoding] = useState<string>('utf-8-sig');
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(null);
      setImportResult(null);
      setError(null);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      setError('ファイルを選択してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('encoding', encoding);

      const response = await fetch(`${API_BASE_URL}/admin/import/sakes/preview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 401 || response.status === 403) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`プレビューに失敗しました: ${response.statusText}`);
      }

      const data: PreviewResponse = await response.json();
      setPreview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'プレビューに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('ファイルを選択してください');
      return;
    }

    if (!confirm('CSVデータをインポートしますか？この操作は取り消せません。')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('encoding', encoding);
      formData.append('dry_run', 'false');

      const response = await fetch(`${API_BASE_URL}/admin/import/sakes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 401 || response.status === 403) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`インポートに失敗しました: ${response.statusText}`);
      }

      const data: ImportResponse = await response.json();
      setImportResult(data);
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'インポートに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">日本酒データCSVインポート</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">CSVファイルを選択</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CSVファイル
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              選択されたファイル: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            文字エンコーディング
          </label>
          <select
            value={encoding}
            onChange={(e) => setEncoding(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="utf-8-sig">UTF-8 (推奨)</option>
            <option value="cp932">Shift-JIS (CP932)</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handlePreview}
            disabled={!file || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'プレビュー中...' : 'プレビュー'}
          </button>
          
          {preview && preview.success && (
            <button
              onClick={handleImport}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'インポート中...' : 'インポート実行'}
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      {preview && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">プレビュー結果</h2>
          
          {!preview.success ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 font-semibold mb-2">エラーが発生しました:</p>
              <ul className="list-disc list-inside">
                {preview.errors.map((err, idx) => (
                  <li key={idx} className="text-red-700">{err}</li>
                ))}
              </ul>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-md">
                  <p className="text-sm text-gray-600">総行数</p>
                  <p className="text-2xl font-bold text-blue-700">{preview.total_rows}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-md">
                  <p className="text-sm text-gray-600">新規日本酒</p>
                  <p className="text-2xl font-bold text-green-700">{preview.stats.sakes_to_create}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-md">
                  <p className="text-sm text-gray-600">既存日本酒</p>
                  <p className="text-2xl font-bold text-yellow-700">{preview.stats.sakes_existing}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-md">
                  <p className="text-sm text-gray-600">新規醸造所</p>
                  <p className="text-2xl font-bold text-purple-700">{preview.stats.breweries_to_create}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">スキップ行</p>
                  <p className="text-2xl font-bold text-gray-700">{preview.stats.rows_to_skip}</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-md">
                  <p className="text-sm text-gray-600">エンコーディング</p>
                  <p className="text-lg font-bold text-indigo-700">{preview.encoding_used}</p>
                </div>
              </div>

              {preview.errors.length > 0 && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-800 font-semibold mb-2">警告:</p>
                  <ul className="list-disc list-inside">
                    {preview.errors.map((err, idx) => (
                      <li key={idx} className="text-yellow-700">{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <h3 className="text-lg font-semibold mb-3">データサンプル (最初の{preview.preview.length}件)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">醸造所</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">所在地</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">都道府県</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">日本酒名</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">読み</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.preview.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm text-gray-900">{row.brewery_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.brewery_location}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <span className={row.brewery_prefecture === '不明' ? 'text-yellow-600' : 'text-gray-900'}>
                            {row.brewery_prefecture}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.sake_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.sake_kana}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {importResult && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">インポート結果</h2>
          
          {!importResult.success ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 font-semibold mb-2">インポートに失敗しました:</p>
              <ul className="list-disc list-inside">
                {importResult.stats.errors.map((err, idx) => (
                  <li key={idx} className="text-red-700">{err}</li>
                ))}
              </ul>
            </div>
          ) : (
            <>
              <div className="p-4 bg-green-50 border border-green-200 rounded-md mb-6">
                <p className="text-green-800 font-semibold">✓ インポートが完了しました</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-md">
                  <p className="text-sm text-gray-600">処理行数</p>
                  <p className="text-2xl font-bold text-blue-700">{importResult.stats.rows_processed}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-md">
                  <p className="text-sm text-gray-600">新規日本酒</p>
                  <p className="text-2xl font-bold text-green-700">{importResult.stats.sakes_created}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-md">
                  <p className="text-sm text-gray-600">新規醸造所</p>
                  <p className="text-2xl font-bold text-purple-700">{importResult.stats.breweries_created}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-md">
                  <p className="text-sm text-gray-600">更新醸造所</p>
                  <p className="text-2xl font-bold text-yellow-700">{importResult.stats.breweries_updated}</p>
                </div>
              </div>

              {importResult.stats.errors.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-800 font-semibold mb-2">警告 ({importResult.stats.errors.length}件):</p>
                  <ul className="list-disc list-inside max-h-40 overflow-y-auto">
                    {importResult.stats.errors.slice(0, 10).map((err, idx) => (
                      <li key={idx} className="text-yellow-700 text-sm">{err}</li>
                    ))}
                    {importResult.stats.errors.length > 10 && (
                      <li className="text-yellow-600 text-sm italic">...他 {importResult.stats.errors.length - 10} 件</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="mt-6">
                <button
                  onClick={() => router.push('/sakes')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  日本酒一覧を見る
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded-md">
        <h3 className="font-semibold mb-2">CSVフォーマット</h3>
        <p className="text-sm text-gray-600 mb-2">以下の列を含むCSVファイルをアップロードしてください:</p>
        <ul className="list-disc list-inside text-sm text-gray-600">
          <li><code>prefecture</code>: 都道府県 (任意、locationから自動抽出を試みます)</li>
          <li><code>brewery</code>: 醸造所名 (必須)</li>
          <li><code>location</code>: 所在地 (任意)</li>
          <li><code>brand</code>: 日本酒銘柄名 (必須)</li>
          <li><code>brand_kana</code>: 読み仮名 (任意)</li>
        </ul>
      </div>
    </div>
  );
}
