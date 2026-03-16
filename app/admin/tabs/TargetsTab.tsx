"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Input from "../components/Input";
import Badge from "../components/Badge";
import { CrawlTarget } from "../types";

const EMPTY_FORM = {
  name: "",
  target_url: "",
  row_selector: "",
  title_selector: "",
  date_selector: "",
  author_selector: "",
  page_param: "page",
  keywords: "",
  is_active: true,
};

type Form = typeof EMPTY_FORM;

export default function TargetsTab() {
  const [targets, setTargets] = useState<CrawlTarget[]>([]);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchTargets(); }, []);

  async function fetchTargets() {
    const { data, error } = await supabase
      .from("tb_crawl_target")
      .select("*")
      .order("id");
    if (error) setError(error.message);
    else setTargets(data as CrawlTarget[]);
  }

  function startNew() {
    setForm(EMPTY_FORM);
    setEditingId("new");
    setError(null);
  }

  function startEdit(t: CrawlTarget) {
    setForm({
      name: t.name,
      target_url: t.target_url,
      row_selector: t.row_selector,
      title_selector: t.title_selector,
      date_selector: t.date_selector,
      author_selector: t.author_selector ?? "",
      page_param: t.page_param,
      keywords: (t.keywords ?? []).join(", "),
      is_active: t.is_active,
    });
    setEditingId(t.id);
    setError(null);
  }

  function cancel() { setEditingId(null); setError(null); }

  function F(field: keyof Form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toPayload() {
    return {
      name: form.name,
      target_url: form.target_url,
      row_selector: form.row_selector,
      title_selector: form.title_selector,
      date_selector: form.date_selector,
      author_selector: form.author_selector || null,
      page_param: form.page_param || "page",
      keywords: form.keywords
        ? form.keywords.split(",").map((k) => k.trim()).filter(Boolean)
        : [],
      is_active: form.is_active,
    };
  }

  async function save() {
    setError(null);
    if (!form.name || !form.target_url || !form.row_selector || !form.title_selector || !form.date_selector) {
      setError("이름, URL, row/title/date 셀렉터는 필수입니다.");
      return;
    }
    const payload = toPayload();
    const { error } = editingId === "new"
      ? await supabase.from("tb_crawl_target").insert(payload)
      : await supabase.from("tb_crawl_target").update(payload).eq("id", editingId);
    if (error) { setError(error.message); return; }
    setEditingId(null);
    fetchTargets();
  }

  async function remove(id: number) {
    if (!confirm("삭제하면 연관된 실행내역과 수집 뉴스의 target_id가 null이 됩니다. 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("tb_crawl_target").delete().eq("id", id);
    if (error) setError(error.message);
    else fetchTargets();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">크롤링 타겟 ({targets.length})</h2>
        <button onClick={startNew} className="bg-blue-600 hover:bg-blue-700 text-sm font-bold py-1.5 px-4 rounded">
          + 새 타겟
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {editingId !== null && (
        <div className="bg-gray-800 rounded-lg p-5 space-y-3 border border-gray-600">
          <h3 className="font-semibold text-blue-400">
            {editingId === "new" ? "새 타겟 추가" : "타겟 수정"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="이름 *" value={form.name} onChange={(e) => F("name", e.target.value)} placeholder="예: kautm 비즈니스 뉴스" />
            <Input label="URL *" value={form.target_url} onChange={(e) => F("target_url", e.target.value)} placeholder="https://..." />
            <Input label="행 셀렉터 (row) *" value={form.row_selector} onChange={(e) => F("row_selector", e.target.value)} placeholder="div.listTable > table > tbody > tr" />
            <Input label="제목 셀렉터 (title) *" value={form.title_selector} onChange={(e) => F("title_selector", e.target.value)} placeholder="td.title > a" />
            <Input label="날짜 셀렉터 (date) *" value={form.date_selector} onChange={(e) => F("date_selector", e.target.value)} placeholder="td:nth-child(4)" />
            <Input label="작성자 셀렉터 (author)" value={form.author_selector} onChange={(e) => F("author_selector", e.target.value)} placeholder="td:nth-child(3)" />
            <Input label="페이지 파라미터" value={form.page_param} onChange={(e) => F("page_param", e.target.value)} placeholder="page" />
            <Input label="키워드 (쉼표 구분)" value={form.keywords} onChange={(e) => F("keywords", e.target.value)} placeholder="기술이전, 특허, TLO" />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => F("is_active", e.target.checked)} className="w-4 h-4" />
            활성화
          </label>
          <div className="flex gap-2 pt-1">
            <button onClick={save} className="bg-green-600 hover:bg-green-700 text-sm font-bold py-1.5 px-4 rounded">저장</button>
            <button onClick={cancel} className="bg-gray-600 hover:bg-gray-500 text-sm font-bold py-1.5 px-4 rounded">취소</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {targets.map((t) => (
          <div key={t.id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{t.name}</span>
                  <Badge active={t.is_active} />
                </div>
                <p className="text-xs text-blue-400 truncate">{t.target_url}</p>
                <p className="text-xs text-gray-400">
                  row: <span className="text-gray-300">{t.row_selector}</span>
                </p>
                {t.keywords && t.keywords.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {t.keywords.map((k) => (
                      <span key={k} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{k}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(t)} className="bg-yellow-500 hover:bg-yellow-600 text-xs font-bold py-1 px-3 rounded">수정</button>
                <button onClick={() => remove(t.id)} className="bg-red-600 hover:bg-red-700 text-xs font-bold py-1 px-3 rounded">삭제</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
