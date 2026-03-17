"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TargetsTab from "../tabs/TargetsTab";
import HistoryTab from "../tabs/HistoryTab";
import UsersTab from "../tabs/UsersTab";
import { getAuthUser } from "../../../lib/auth";
import { useTheme } from "../../../lib/theme";

const TABS = [
  { key: "targets", label: "크롤링 타겟", component: TargetsTab },
  { key: "history", label: "실행 내역",   component: HistoryTab },
  { key: "users",   label: "사용자 관리", component: UsersTab   },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function SettingsPage() {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const [tab, setTab] = useState<TabKey>("targets");
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const user = getAuthUser();
    if (!user) {
      router.replace("/login");
    } else {
      setUserName(user.user_nm);
    }
  }, [router]);

  const ActiveTab = TABS.find((t) => t.key === tab)!.component;

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
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin")}
              className="text-sm px-3 py-1.5 rounded-full transition-all duration-200 hover:opacity-80"
              style={{ background: "var(--bg-card)", color: "var(--text-3)", boxShadow: "var(--shadow-sm)" }}
            >
              ← 뒤로
            </button>
            <h1
              className="text-3xl font-bold bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #60a5fa, #a78bfa, #c084fc)" }}
            >
              설정
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: "var(--text-3)" }}>{userName} 님</span>
            <button
              onClick={toggle}
              className="text-sm px-3 py-1.5 rounded-full transition-all duration-200 hover:opacity-80"
              style={{ background: "var(--bg-card)", color: "var(--text-3)", boxShadow: "var(--shadow-sm)" }}
            >
              {theme === "dark" ? "☀️ 라이트" : "🌙 다크"}
            </button>
          </div>
        </div>

        {/* 탭 바 */}
        <div
          className="flex gap-1 mb-8 p-1 rounded-xl w-fit"
          style={{ background: "var(--bg-tabs)", boxShadow: "var(--shadow-sm)" }}
        >
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={
                tab === key
                  ? { backgroundImage: "linear-gradient(135deg, #3b82f6, #8b5cf6)", boxShadow: "0 4px 15px rgba(99,102,241,0.35)", color: "white" }
                  : { color: "var(--text-3)" }
              }
            >
              {label}
            </button>
          ))}
        </div>

        <ActiveTab />
      </div>
    </div>
  );
}
