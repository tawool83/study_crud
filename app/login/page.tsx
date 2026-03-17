'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithCredentials } from '../../services/authService';
import { setAuthUser } from '../../lib/auth';
import { useTheme } from '../../lib/theme';

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await loginWithCredentials(userId, password);
      setAuthUser(user);
      router.replace('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 실패');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-1)' }}
    >
      {/* 테마 토글 */}
      <button
        onClick={toggle}
        className="fixed top-4 right-4 text-sm px-3 py-1.5 rounded-full transition-all duration-200 hover:opacity-80"
        style={{ background: 'var(--bg-card)', color: 'var(--text-3)', boxShadow: 'var(--shadow-sm)' }}
      >
        {theme === 'dark' ? '☀️ 라이트' : '🌙 다크'}
      </button>

      {/* 로그인 카드 */}
      <div
        className="w-full max-w-sm p-8 rounded-2xl"
        style={{ background: 'var(--bg-card-md)', boxShadow: 'var(--shadow-md)' }}
      >
        <h1
          className="text-2xl font-bold mb-8 text-center bg-clip-text text-transparent"
          style={{ backgroundImage: 'linear-gradient(135deg, #60a5fa, #a78bfa)' }}
        >
          관리자 로그인
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--text-2)' }}>
              아이디
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="사용자 ID"
              required
              className="px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-200"
              style={{ background: 'var(--bg-input)', color: 'var(--text-1)', boxShadow: 'var(--shadow-sm)' }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--text-2)' }}>
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              required
              className="px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-200"
              style={{ background: 'var(--bg-input)', color: 'var(--text-1)', boxShadow: 'var(--shadow-sm)' }}
            />
          </div>

          {error && (
            <p className="text-sm px-3 py-2 rounded-lg" style={{ background: 'var(--error-bg)', color: '#fca5a5' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50 mt-2"
            style={{ backgroundImage: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.35)' }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
