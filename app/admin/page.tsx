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
    <div className="container mx-auto p-8 bg-gray-900 text-white min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">크롤러 관리</h1>
        <a href="/" className="text-sm text-gray-400 hover:text-white transition-colors">← 메인으로</a>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-800 p-1 rounded-lg w-fit">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === key ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ActiveTab />
    </div>
  );
}
