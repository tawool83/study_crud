'use client';

import { useHistory } from '../../../hooks/useHistory';

export default function HistoryTab() {
  const { rows, loading, error } = useHistory();

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold" style={{ color: 'var(--text-1)' }}>
        실행 내역{' '}
        <span className="text-sm font-normal" style={{ color: 'var(--text-3)' }}>(최근 100건)</span>
      </h2>

      {error && (
        <p className="text-sm px-4 py-3 rounded-lg" style={{ background: 'var(--error-bg)', color: '#fca5a5' }}>
          {error}
        </p>
      )}

      {loading && <p className="text-sm" style={{ color: 'var(--text-3)' }}>불러오는 중...</p>}

      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider" style={{ background: 'var(--bg-card-md)', borderBottom: '1px solid var(--divider)', color: 'var(--text-2)' }}>
              <th className="px-5 py-3.5 text-left font-semibold">실행일시</th>
              <th className="px-5 py-3.5 text-left font-semibold">타겟</th>
              <th className="px-5 py-3.5 text-left font-semibold">마지막 수집일</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} style={i !== rows.length - 1 ? { borderBottom: '1px solid var(--divider)' } : {}}>
                <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text-3)' }}>
                  {new Date(r.executed_at).toLocaleString('ko-KR')}
                </td>
                <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--text-1)' }}>
                  {r.tb_crawl_target?.name ?? <span className="italic" style={{ color: 'var(--text-4)' }}>삭제된 타겟</span>}
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-xs font-mono" style={{ color: '#60a5fa' }}>{r.last_post_date ?? '-'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
