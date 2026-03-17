"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { RunHistory } from "../types";

export default function HistoryTab() {
  const [rows, setRows] = useState<RunHistory[]>([]);

  useEffect(() => {
    supabase
      .from("tb_crawl_run_history")
      .select("*, tb_crawl_target(name)")
      .order("executed_at", { ascending: false })
      .limit(100)
      .then(({ data }) => setRows((data as RunHistory[]) ?? []));
  }, []);

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-white/90">
        실행 내역{" "}
        <span className="text-sm font-normal text-white/40">(최근 100건)</span>
      </h2>

      <div className="rounded-xl overflow-hidden border border-white/10 backdrop-blur-md" style={{ background: "rgba(255,255,255,0.04)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-300 uppercase tracking-wider" style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <th className="px-5 py-3.5 text-left font-semibold">실행일시</th>
              <th className="px-5 py-3.5 text-left font-semibold">타겟</th>
              <th className="px-5 py-3.5 text-left font-semibold">마지막 수집일</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className="transition-colors duration-150 hover:bg-white/[0.04]" style={i !== rows.length - 1 ? { borderBottom: "1px solid rgba(255,255,255,0.05)" } : {}}>
                <td className="px-5 py-3.5 text-gray-300 text-xs">{new Date(r.executed_at).toLocaleString("ko-KR")}</td>
                <td className="px-5 py-3.5 text-white font-medium">
                  {r.tb_crawl_target?.name ?? <span className="text-gray-500 italic">삭제된 타겟</span>}
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-blue-300 text-xs font-mono">{r.last_post_date ?? "-"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
