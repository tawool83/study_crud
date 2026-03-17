import { supabase } from '../lib/supabaseClient';
import type { NewsItem } from '../types';

export async function getNews(
  targetId?: number,
  limit = 200,
): Promise<NewsItem[]> {
  let query = supabase
    .from('tb_news_crawl')
    .select('*, tb_crawl_target(name)')
    .order('crawled_at', { ascending: false })
    .limit(limit);

  if (targetId !== undefined) {
    query = query.eq('target_id', targetId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as NewsItem[]) ?? [];
}

export async function deleteNews(id: number): Promise<void> {
  const { error } = await supabase
    .from('tb_news_crawl')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}
