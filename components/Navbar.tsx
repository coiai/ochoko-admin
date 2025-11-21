'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();

  console.log("Navbar Log:", { user, isAuthenticated, loading });

  if (loading) return null;        // ✅ 認証確認中は描画しない
  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/sakes" className="text-white text-xl font-bold">
                🍶 Ochoko Admin
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/sakes"
                className="text-white hover:bg-indigo-700 inline-flex items-center px-3 py-2 rounded-md text-sm font-medium"
              >
                日本酒管理
              </Link>
              <Link
                href="/duplicates"
                className="text-white hover:bg-indigo-700 inline-flex items-center px-3 py-2 rounded-md text-sm font-medium"
              >
                重複チェック
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-white text-sm mr-4">
              {user?.display_name || user?.username}
            </span>
            <button
              onClick={handleLogout}
              className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
