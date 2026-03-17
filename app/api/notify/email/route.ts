import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '../../../../lib/supabaseClient';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';

export async function POST(req: NextRequest) {
  const { user_id, subject, message } = await req.json();

  if (!user_id) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  }

  // DB에서 사용자 email 조회
  const { data: user, error } = await supabase
    .from('tb_users_k')
    .select('user_nm, email')
    .eq('id', user_id)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (!user.email) {
    return NextResponse.json({ error: 'No email configured for this user' }, { status: 400 });
  }

  const { data, error: sendError } = await resend.emails.send({
    from: FROM,
    to: user.email,
    subject: subject ?? '알림 테스트',
    html: message
      ? `<p>${message}</p>`
      : `<p>안녕하세요, <strong>${user.user_nm}</strong>님!<br/>이메일 알림 테스트입니다.</p>`,
  });

  if (sendError) {
    return NextResponse.json({ error: sendError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: `이메일 전송 완료 → ${user.email}`, id: data?.id });
}
