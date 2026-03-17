// ─── Database row shapes ─────────────────────────────────────────────────────

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

export type User = {
  id: number;
  user_nm: string;
  user_id: string;
  age: number | null;
  birthday_dtm: string | null;
  created_at: string;
};

export type AuthUser = {
  id: number;
  user_nm: string;
  user_id: string;
};

// ─── Lightweight projections ─────────────────────────────────────────────────

export type TargetOption = {
  id: number;
  name: string;
};

// ─── Form value shapes (string-based for controlled inputs) ──────────────────

export type TargetFormValues = {
  name: string;
  target_url: string;
  row_selector: string;
  title_selector: string;
  date_selector: string;
  author_selector: string;
  page_param: string;
  keywords: string; // comma-separated in form, string[] in DB
  is_active: boolean;
};

export type UserFormValues = {
  user_nm: string;
  user_id: string;
  age: string;         // number as string for input[type=number]
  birthday_dtm: string;
  password: string;
};

// ─── Service payload shapes ───────────────────────────────────────────────────

export type TargetPayload = Omit<CrawlTarget, 'id' | 'created_at'>;

export type UserInsertPayload = {
  user_nm: string;
  user_id: string;
  age: number | null;
  birthday_dtm: string | null;
  password: string;
};

export type UserUpdatePayload = Omit<Partial<UserInsertPayload>, 'password'> & {
  password?: string;
};
