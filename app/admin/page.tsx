"use client";

import { useState } from "react";
import TargetsTab from "./tabs/TargetsTab";
import HistoryTab from "./tabs/HistoryTab";
import NewsTab from "./tabs/NewsTab";

// ── 탭 등록: 새 테이블 탭을 추가할 때 여기에만 추가하세요 ──────────────────
const TABS = [
  { key: "targets", label: "크롤링 타겟", component: TargetsTab },
  { key: "history", label: "실행 내역",   component: HistoryTab },
  { key: "news",    label: "수집 뉴스",   component: NewsTab    },
] as const;

type TabKey = (typeof TABS)[number]["key"];
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [tab, setTab] = useState<TabKey>(TABS[0].key);
  const ActiveTab = TABS.find((t) => t.key === tab)!.component;

  return (
    <div
      className="min-h-screen text-white"
      style={{
        backgroundColor: "#080b14",
        backgroundImage: `
          radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.07) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.07) 0%, transparent 60%),
          url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Ccircle fill='%23ffffff' cx='20' cy='20' r='1' opacity='0.04'/%3E%3C/g%3E%3C/svg%3E")
        `,
      }}
    >
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1
            className="text-3xl font-bold bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, #60a5fa, #a78bfa, #c084fc)" }}
          >
            크롤러 관리
          </h1>
          <a
            href="/"
            className="text-sm text-white/40 hover:text-white/80 transition-colors duration-200 px-4 py-2 rounded-full border border-white/10 hover:border-white/20 backdrop-blur-sm"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            ← 메인으로
          </a>
        </div>

        <div
          className="flex gap-1 mb-8 p-1 rounded-xl w-fit backdrop-blur-md border border-white/10"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === key
                  ? "text-white shadow-lg"
                  : "text-white/40 hover:text-white/70"
              }`}
              style={
                tab === key
                  ? { backgroundImage: "linear-gradient(135deg, #3b82f6, #8b5cf6)", boxShadow: "0 4px 15px rgba(99,102,241,0.35)" }
                  : {}
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
