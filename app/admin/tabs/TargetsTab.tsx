'use client';

import { useTargets } from '../../../hooks/useTargets';
import Input from '../components/Input';
import Badge from '../components/Badge';

export default function TargetsTab() {
  const {
    targets, error, formError,
    editingId, form,
    startNew, startEdit, cancel, setField, save, remove,
  } = useTargets();

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-1)' }}>
          크롤링 타겟{' '}
          <span className="text-sm font-normal" style={{ color: 'var(--text-3)' }}>({targets.length})</span>
        </h2>
        <button
          onClick={startNew}
          className="text-sm font-semibold py-2 px-5 rounded-full text-white transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95"
          style={{ backgroundImage: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.35)' }}
        >
          + 새 타겟
        </button>
      </div>

      {error && (
        <p className="text-sm px-4 py-3 rounded-lg" style={{ background: 'var(--error-bg)', color: '#fca5a5' }}>
          {error}
        </p>
      )}

      {editingId !== null && (
        <div className="rounded-xl p-6 space-y-4" style={{ background: 'var(--bg-card-md)', boxShadow: 'var(--shadow-md)' }}>
          <h3 className="font-semibold text-sm tracking-wide bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #60a5fa, #a78bfa)' }}>
            {editingId === 'new' ? '새 타겟 추가' : '타겟 수정'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="이름 *" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="예: kautm 비즈니스 뉴스" />
            <Input label="URL *" value={form.target_url} onChange={(e) => setField('target_url', e.target.value)} placeholder="https://..." />
            <Input label="행 셀렉터 (row) *" value={form.row_selector} onChange={(e) => setField('row_selector', e.target.value)} placeholder="div.listTable > table > tbody > tr" />
            <Input label="제목 셀렉터 (title) *" value={form.title_selector} onChange={(e) => setField('title_selector', e.target.value)} placeholder="td.title > a" />
            <Input label="날짜 셀렉터 (date) *" value={form.date_selector} onChange={(e) => setField('date_selector', e.target.value)} placeholder="td:nth-child(4)" />
            <Input label="작성자 셀렉터 (author)" value={form.author_selector} onChange={(e) => setField('author_selector', e.target.value)} placeholder="td:nth-child(3)" />
            <Input label="페이지 파라미터" value={form.page_param} onChange={(e) => setField('page_param', e.target.value)} placeholder="page" />
            <Input label="키워드 (쉼표 구분)" value={form.keywords} onChange={(e) => setField('keywords', e.target.value)} placeholder="기술이전, 특허, TLO" />
          </div>
          <label className="flex items-center gap-2.5 text-sm cursor-pointer" style={{ color: 'var(--text-2)' }}>
            <input type="checkbox" checked={form.is_active} onChange={(e) => setField('is_active', e.target.checked)} className="w-4 h-4 rounded accent-blue-500" />
            활성화
          </label>
          {formError && (
            <p className="text-sm px-3 py-2 rounded-lg" style={{ background: 'var(--error-bg)', color: '#fca5a5' }}>
              {formError}
            </p>
          )}
          <div className="flex gap-2 pt-1">
            <button onClick={save} className="text-sm font-semibold py-2 px-5 rounded-full text-white transition-all duration-200 hover:opacity-90" style={{ backgroundImage: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
              저장
            </button>
            <button onClick={cancel} className="text-sm font-semibold py-2 px-5 rounded-full transition-all duration-200 hover:opacity-80" style={{ background: 'var(--bg-card)', color: 'var(--text-2)', boxShadow: 'var(--shadow-sm)' }}>
              취소
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {targets.map((t) => (
          <div key={t.id} className="rounded-xl p-4 transition-all duration-200 group" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold" style={{ color: 'var(--text-1)' }}>{t.name}</span>
                  <Badge active={t.is_active} />
                </div>
                <p className="text-xs truncate" style={{ color: '#60a5fa' }}>{t.target_url}</p>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                  row: <span style={{ color: 'var(--text-2)' }}>{t.row_selector}</span>
                </p>
                {t.keywords && t.keywords.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {t.keywords.map((k) => (
                      <span key={k} className="text-xs px-2.5 py-0.5 rounded-full" style={{ background: 'var(--keyword-bg)', color: '#a78bfa' }}>
                        {k}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => startEdit(t)}
                  className="text-xs font-semibold py-1.5 px-3.5 rounded-full transition-all duration-150"
                  style={{ background: 'var(--amber-bg)', color: '#fbbf24' }}
                >
                  수정
                </button>
                <button
                  onClick={() => { if (confirm('삭제하면 연관된 실행내역과 수집 뉴스의 target_id가 null이 됩니다. 삭제하시겠습니까?')) remove(t.id); }}
                  className="text-xs font-semibold py-1.5 px-3.5 rounded-full transition-all duration-150"
                  style={{ background: 'var(--red-bg)', color: '#f87171' }}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
