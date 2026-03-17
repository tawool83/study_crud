'use client';

import { useNews } from '../../../hooks/useNews';

export default function NewsTab() {
  const {
    news, targetOptions, filterTargetId,
    loading, error,
    setFilterTargetId, remove,
  } = useNews();

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-1)' }}>
          수집 뉴스{' '}
          <span className="text-sm font-normal" style={{ color: 'var(--text-3)' }}>(최근 200건)</span>
        </h2>
        <select
          value={filterTargetId}
          onChange={(e) => setFilterTargetId(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 cursor-pointer"
          style={{ background: 'var(--bg-input)', color: 'var(--text-1)', boxShadow: 'var(--shadow-sm)' }}
        >
          <option value="" style={{ background: 'var(--bg-page)' }}>전체 타겟</option>
          {targetOptions.map((t) => (
            <option key={t.id} value={t.id} style={{ background: 'var(--bg-page)' }}>{t.name}</option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-sm px-4 py-3 rounded-lg" style={{ background: 'var(--error-bg)', color: '#fca5a5' }}>
          {error}
        </p>
      )}

      {loading && <p className="text-sm" style={{ color: 'var(--text-3)' }}>불러오는 중...</p>}

      <div className="space-y-2">
        {news.map((n) => (
          <div
            key={n.id}
            className="rounded-xl p-4 flex justify-between items-start gap-4 transition-all duration-200 group"
            style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="flex-1 min-w-0 space-y-1.5">
              <a
                href={n.link}
                target="_blank"
                rel="noreferrer"
                className="font-medium hover:text-blue-400 transition-colors duration-150 line-clamp-1 block"
                style={{ color: 'var(--text-1)' }}
              >
                {n.title}
              </a>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                <span style={{ color: '#a78bfa' }}>{n.tb_crawl_target?.name ?? '알 수 없음'}</span>
                {' · '}<span>{n.post_date ?? '-'}</span>
                {' · '}<span>{n.author ?? '-'}</span>
              </p>
            </div>
            <button
              onClick={() => remove(n.id)}
              className="text-xs font-semibold py-1.5 px-3.5 rounded-full opacity-50 group-hover:opacity-100 transition-all duration-200 shrink-0"
              style={{ background: 'var(--red-bg)', color: '#f87171' }}
            >
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
