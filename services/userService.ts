import { supabase } from '../lib/supabaseClient';
import { hashPassword } from '../lib/crypto';
import type { User, UserInsertPayload, UserUpdatePayload } from '../types';

const SELECT_COLS = 'id, user_nm, user_id, age, birthday_dtm, created_at';

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('tb_users_k')
    .select(SELECT_COLS)
    .order('id');
  if (error) throw new Error(error.message);
  return (data as User[]) ?? [];
}

export async function createUser(payload: UserInsertPayload): Promise<User> {
  const hashed = await hashPassword(payload.password);
  const { data, error } = await supabase
    .from('tb_users_k')
    .insert({ ...payload, password: hashed })
    .select(SELECT_COLS)
    .single();
  if (error) throw new Error(error.message);
  return data as User;
}

export async function updateUser(
  id: number,
  payload: UserUpdatePayload,
): Promise<User> {
  const finalPayload = payload.password
    ? { ...payload, password: await hashPassword(payload.password) }
    : payload;

  const { data, error } = await supabase
    .from('tb_users_k')
    .update(finalPayload)
    .eq('id', id)
    .select(SELECT_COLS)
    .single();
  if (error) throw new Error(error.message);
  return data as User;
}

export async function deleteUser(id: number): Promise<void> {
  const { error } = await supabase
    .from('tb_users_k')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}
