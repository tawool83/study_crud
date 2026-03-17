import { supabase } from '../lib/supabaseClient';
import type { RunHistory } from '../types';

export async function getRunHistory(limit = 100): Promise<RunHistory[]> {
  const { data, error } = await supabase
    .from('tb_crawl_run_history')
    .select('*, tb_crawl_target(name)')
    .order('executed_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data as RunHistory[]) ?? [];
}
