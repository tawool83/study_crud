"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NewsTab from "./tabs/NewsTab";
import { getAuthUser, clearAuthUser } from "../../lib/auth";
import { useTheme } from "../../lib/theme";

const GearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

export default function AdminPage() {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const user = getAuthUser();
    if (!user) {
      router.replace("/login");
    } else {
      setUserName(user.user_nm);
    }
  }, [router]);

  function handleLogout() {
    clearAuthUser();
    router.replace("/login");
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--bg-page)",
        color: "var(--text-1)",
        backgroundImage: `
          radial-gradient(ellipse at 20% 50%, var(--radial-1) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 20%, var(--radial-2) 0%, transparent 60%)
        `,
      }}
    >
      <div className="mx-[10%] py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <h1
            className="text-3xl font-bold bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, #60a5fa, #a78bfa, #c084fc)" }}
          >
            크롤러 관리
          </h1>

          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: "var(--text-3)" }}>{userName} 님</span>
            <button
              onClick={() => router.push("/admin/settings")}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-all duration-200 hover:opacity-80"
              style={{ background: "var(--bg-card)", color: "var(--text-3)", boxShadow: "var(--shadow-sm)" }}
            >
              <GearIcon />
              <span>설정</span>
            </button>
            <button
              onClick={toggle}
              className="text-sm px-3 py-1.5 rounded-full transition-all duration-200 hover:opacity-80"
              style={{ background: "var(--bg-card)", color: "var(--text-3)", boxShadow: "var(--shadow-sm)" }}
            >
              {theme === "dark" ? "☀️ 라이트" : "🌙 다크"}
            </button>
            <button
              onClick={handleLogout}
              className="text-sm px-4 py-2 rounded-full transition-colors duration-200 hover:opacity-80"
              style={{ background: "var(--bg-card)", color: "var(--text-2)", boxShadow: "var(--shadow-sm)" }}
            >
              로그아웃
            </button>
          </div>
        </div>

        <NewsTab />
      </div>
    </div>
  );
}
