import { supabase } from '../lib/supabaseClient';
import { hashPassword } from '../lib/crypto';
import type { AuthUser } from '../types';

export async function loginWithCredentials(
  userId: string,
  password: string,
): Promise<AuthUser> {
  const hashed = await hashPassword(password);

  const { data, error } = await supabase
    .from('tb_users_k')
    .select('id, user_nm, user_id')
    .eq('user_id', userId)
    .eq('password', hashed)
    .single();

  if (error || !data) {
    throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
  }

  return data as AuthUser;
}
