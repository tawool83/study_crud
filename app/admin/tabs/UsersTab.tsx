'use client';

import { useUsers } from '../../../hooks/useUsers';
import Input from '../components/Input';

export default function UsersTab() {
  const {
    users, error, formError,
    editingId, form,
    startNew, startEdit, cancel, setField, save, remove,
  } = useUsers();

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-1)' }}>
          사용자 관리{' '}
          <span className="text-sm font-normal" style={{ color: 'var(--text-3)' }}>({users.length})</span>
        </h2>
        <button
          onClick={startNew}
          className="text-sm font-semibold py-2 px-5 rounded-full text-white transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95"
          style={{ backgroundImage: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.35)' }}
        >
          + 새 사용자
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
            {editingId === 'new' ? '새 사용자 추가' : '사용자 수정'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="이름 *" value={form.user_nm} onChange={(e) => setField('user_nm', e.target.value)} placeholder="홍길동" />
            <Input label="아이디 *" value={form.user_id} onChange={(e) => setField('user_id', e.target.value)} placeholder="hong123" />
            <Input label="나이" type="number" value={form.age} onChange={(e) => setField('age', e.target.value)} placeholder="30" />
            <Input label="생일" type="date" value={form.birthday_dtm} onChange={(e) => setField('birthday_dtm', e.target.value)} />
            <Input
              label={editingId === 'new' ? '비밀번호 *' : '비밀번호 (변경 시만 입력)'}
              type="password"
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {/* 알림 설정 */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-3)' }}>알림 설정</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="이메일"
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                placeholder="example@email.com"
              />
              <Input
                label="Slack Webhook URL"
                type="url"
                value={form.slack_webhook_url}
                onChange={(e) => setField('slack_webhook_url', e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
          </div>
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
        {users.map((u) => (
          <div
            key={u.id}
            className="rounded-xl p-4 transition-all duration-200 group"
            style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <p className="font-semibold" style={{ color: 'var(--text-1)' }}>
                  {u.user_nm}{' '}
                  <span className="text-sm font-normal" style={{ color: 'var(--text-3)' }}>({u.user_id})</span>
                </p>
                <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                  나이: {u.age ?? '미입력'} · 생일: {u.birthday_dtm ? new Date(u.birthday_dtm).toLocaleDateString('ko-KR') : '미입력'}
                </p>
                <div className="flex gap-3 flex-wrap">
                  {u.email && (
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                      ✉️ {u.email}
                    </span>
                  )}
                  {u.slack_webhook_url && (
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                      💬 Slack 연동됨
                    </span>
                  )}
                </div>
                <p className="text-xs" style={{ color: 'var(--text-4)' }}>
                  ID: {u.id} · 생성: {new Date(u.created_at).toLocaleString('ko-KR')}
                </p>
              </div>
              <div className="flex gap-2 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => startEdit(u)}
                  className="text-xs font-semibold py-1.5 px-3.5 rounded-full transition-all duration-150"
                  style={{ background: 'var(--amber-bg)', color: '#fbbf24' }}
                >
                  수정
                </button>
                <button
                  onClick={() => { if (confirm('이 사용자를 삭제하시겠습니까?')) remove(u.id); }}
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
