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
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">실행 내역 (최근 100건)</h2>
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-700 text-gray-300 text-xs">
            <tr>
              <th className="p-3 text-left">실행일시</th>
              <th className="p-3 text-left">타겟</th>
              <th className="p-3 text-left">마지막 수집일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-gray-700">
                <td className="p-3 text-gray-300">{new Date(r.executed_at).toLocaleString("ko-KR")}</td>
                <td className="p-3">{r.tb_crawl_target?.name ?? <span className="text-gray-500">삭제된 타겟</span>}</td>
                <td className="p-3 text-blue-400">{r.last_post_date ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
