import { supabase } from '../lib/supabaseClient';
import type { CrawlTarget, TargetOption, TargetPayload } from '../types';

export async function getTargets(): Promise<CrawlTarget[]> {
  const { data, error } = await supabase
    .from('tb_crawl_target')
    .select('*')
    .order('id');
  if (error) throw new Error(error.message);
  return (data as CrawlTarget[]) ?? [];
}

export async function getTargetOptions(): Promise<TargetOption[]> {
  const { data, error } = await supabase
    .from('tb_crawl_target')
    .select('id, name')
    .order('id');
  if (error) throw new Error(error.message);
  return (data as TargetOption[]) ?? [];
}

export async function createTarget(payload: TargetPayload): Promise<CrawlTarget> {
  const { data, error } = await supabase
    .from('tb_crawl_target')
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as CrawlTarget;
}

export async function updateTarget(
  id: number,
  payload: Partial<TargetPayload>,
): Promise<CrawlTarget> {
  const { data, error } = await supabase
    .from('tb_crawl_target')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as CrawlTarget;
}

export async function deleteTarget(id: number): Promise<void> {
  const { error } = await supabase
    .from('tb_crawl_target')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}
