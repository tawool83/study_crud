"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { NewsItem } from "../types";

export default function NewsTab() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filterTarget, setFilterTarget] = useState<string>("");
  const [targets, setTargets] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    supabase
      .from("tb_crawl_target")
      .select("id, name")
      .order("id")
      .then(({ data }) => setTargets(data ?? []));
  }, []);

  useEffect(() => {
    let query = supabase
      .from("tb_news_crawl")
      .select("*, tb_crawl_target(name)")
      .order("crawled_at", { ascending: false })
      .limit(200);
    if (filterTarget) query = query.eq("target_id", filterTarget);
    query.then(({ data }) => setNews((data as NewsItem[]) ?? []));
  }, [filterTarget]);

  async function remove(id: number) {
    await supabase.from("tb_news_crawl").delete().eq("id", id);
    setNews((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">수집 뉴스 (최근 200건)</h2>
        <select
          value={filterTarget}
          onChange={(e) => setFilterTarget(e.target.value)}
          className="p-2 rounded bg-gray-700 border border-gray-600 text-sm focus:outline-none"
        >
          <option value="">전체 타겟</option>
          {targets.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {news.map((n) => (
          <div key={n.id} className="bg-gray-800 rounded-lg p-4 flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0 space-y-1">
              <a href={n.link} target="_blank" rel="noreferrer" className="font-medium hover:text-blue-400 transition-colors line-clamp-1">
                {n.title}
              </a>
              <p className="text-xs text-gray-400">
                {n.tb_crawl_target?.name ?? "알 수 없음"} · {n.post_date ?? "-"} · {n.author ?? "-"}
              </p>
            </div>
            <button
              onClick={() => remove(n.id)}
              className="bg-red-600 hover:bg-red-700 text-xs font-bold py-1 px-3 rounded shrink-0"
            >
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
