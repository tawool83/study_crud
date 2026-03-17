import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

export async function POST(req: NextRequest) {
  const { user_id, message } = await req.json();

  if (!user_id) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  }

  // DB에서 사용자 slack_webhook_url 조회
  const { data: user, error } = await supabase
    .from('tb_users_k')
    .select('user_nm, slack_webhook_url')
    .eq('id', user_id)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (!user.slack_webhook_url) {
    return NextResponse.json({ error: 'No Slack webhook URL configured for this user' }, { status: 400 });
  }

  const text = message ?? `안녕하세요, ${user.user_nm}님! Slack 알림 테스트입니다.`;

  const res = await fetch(user.slack_webhook_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const body = await res.text();
    return NextResponse.json({ error: `Slack 발송 실패: ${body}` }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: `Slack 메시지 전송 완료 → ${user.user_nm}` });
}
