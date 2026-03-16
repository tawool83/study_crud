export type CrawlTarget = {
  id: number;
  name: string;
  target_url: string;
  row_selector: string;
  title_selector: string;
  date_selector: string;
  author_selector: string | null;
  page_param: string;
  keywords: string[] | null;
  is_active: boolean;
  created_at: string;
};

export type RunHistory = {
  id: number;
  target_id: number | null;
  executed_at: string;
  last_post_date: string | null;
  tb_crawl_target: { name: string } | null;
};

export type NewsItem = {
  id: number;
  target_id: number | null;
  title: string;
  link: string;
  post_date: string | null;
  author: string | null;
  crawled_at: string;
  tb_crawl_target: { name: string } | null;
};
