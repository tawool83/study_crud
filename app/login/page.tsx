'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithCredentials } from '../../services/authService';
import { setAuthUser } from '../../lib/auth';
import { useTheme } from '../../lib/theme';

// 아이콘 컴포넌트 (SVG)
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

const LockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);

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
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* 테마 토글 버튼 */}
      <button
        onClick={toggle}
        className="fixed top-8 right-8 z-20 flex items-center gap-3 text-sm px-4 py-2 rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-105 bg-[var(--bg-card)] text-[var(--text-2)] shadow-[var(--shadow-sm)]"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
        <span className="hidden sm:inline">{theme === 'dark' ? '라이트 모드' : '다크 모드'}</span>
      </button>

    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 transition-colors duration-300 bg-[var(--bg-page)]">
      {/* 배경 효과 */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-50"
          style={{
            background: 'radial-gradient(circle, var(--radial-1) 0%, transparent 60%)'
          }}
        />
        <div
          className="absolute -bottom-1/4 -right-1/4 w-2/3 h-2/3 rounded-full opacity-50"
          style={{
            background: 'radial-gradient(circle, var(--radial-2) 0%, transparent 70%)'
          }}
        />
      </div>

      {/* 로그인 카드 */}
      <div className="relative z-10 w-[450px] p-10 rounded-3xl backdrop-blur-xl bg-[var(--bg-card-md)] shadow-[var(--shadow-md)]" style={{ border: '1px solid var(--card-border)' }}>
        <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-[var(--text-1)]">관리자 로그인</h1>
            <p className="mt-3 text-sm text-[var(--text-3)]">
                시스템에 접근하려면 로그인하세요.
            </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-[3px]" style={{ padding: '0 2rem 1.5rem' }}>
          {/* 아이디 필드 */}
          <div className="flex items-center gap-3 rounded-lg bg-[var(--bg-input)] shadow-[var(--shadow-sm)] px-4 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all duration-300">
            <UserIcon className="w-4 h-4 text-[var(--text-4)] flex-shrink-0"/>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="사용자 ID"
              required
              className="w-full h-full py-[15px] bg-transparent text-sm outline-none text-[var(--text-1)] placeholder:text-[var(--text-3)]"
            />
          </div>

          {/* 비밀번호 필드 */}
          <div className="flex items-center gap-3 rounded-lg bg-[var(--bg-input)] shadow-[var(--shadow-sm)] px-4 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all duration-300">
            <LockIcon className="w-4 h-4 text-[var(--text-4)] flex-shrink-0"/>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              required
              className="w-full h-full py-[15px] bg-transparent text-sm outline-none text-[var(--text-1)] placeholder:text-[var(--text-3)]"
            />
          </div>

          {error && (
            <div className="text-sm text-center text-red-400 p-3 rounded-lg bg-[var(--error-bg)]">
              {error}
            </div>
          )}

          {/* 로그인 버튼 */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-[16px] rounded-full text-base font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-100 disabled:opacity-60 disabled:pointer-events-none"
              style={{
                  backgroundImage: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.4)'
              }}
            >
              {loading ? (
                   <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>로그인 중...</span>
                  </div>
              ) : '로그인'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}
