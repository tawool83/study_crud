"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { NewsItem } from "../types";

export default function NewsTab() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filterTarget, setFilterTarget] = useState<string>("");
  const [targets, setTargets] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    supabase.from("tb_crawl_target").select("id, name").order("id")
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
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white/90">
          수집 뉴스{" "}
          <span className="text-sm font-normal text-white/40">(최근 200건)</span>
        </h2>
        <select
          value={filterTarget}
          onChange={(e) => setFilterTarget(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm text-white/70 border border-white/10 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 cursor-pointer"
          style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(8px)" }}
        >
          <option value="" style={{ background: "#0f1624" }}>전체 타겟</option>
          {targets.map((t) => (
            <option key={t.id} value={t.id} style={{ background: "#0f1624" }}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {news.map((n) => (
          <div key={n.id} className="rounded-xl p-4 border border-white/10 backdrop-blur-sm flex justify-between items-start gap-4 hover:border-white/20 transition-all duration-200 group" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="flex-1 min-w-0 space-y-1.5">
              <a href={n.link} target="_blank" rel="noreferrer" className="font-medium text-white/80 hover:text-blue-400 transition-colors duration-150 line-clamp-1 block">
                {n.title}
              </a>
              <p className="text-xs text-white/30">
                <span className="text-violet-400/70">{n.tb_crawl_target?.name ?? "알 수 없음"}</span>
                {" · "}<span>{n.post_date ?? "-"}</span>
                {" · "}<span>{n.author ?? "-"}</span>
              </p>
            </div>
            <button onClick={() => remove(n.id)} className="text-xs font-semibold py-1.5 px-3.5 rounded-full text-red-300 border border-red-500/20 hover:border-red-400/40 opacity-50 group-hover:opacity-100 transition-all duration-200 shrink-0" style={{ background: "rgba(239,68,68,0.1)" }}>
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
