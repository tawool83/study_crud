'use client';

import { useState, useEffect, useCallback } from 'react';
import type { NewsItem, TargetOption } from '../types';
import { getNews, deleteNews } from '../services/newsService';
import { getTargetOptions } from '../services/targetService';

export function useNews(limit = 200) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [targetOptions, setTargetOptions] = useState<TargetOption[]>([]);
  const [filterTargetId, setFilterTargetId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 타겟 옵션은 마운트 시 1회만 조회
  useEffect(() => {
    getTargetOptions()
      .then(setTargetOptions)
      .catch((e) => setError(e instanceof Error ? e.message : '타겟 목록 불러오기 실패'));
  }, []);

  // 뉴스는 filterTargetId 변경 시 재조회, 레이스 컨디션 방지
  const fetchNews = useCallback(async (targetIdStr: string) => {
    setLoading(true);
    const targetId = targetIdStr ? parseInt(targetIdStr, 10) : undefined;
    let cancelled = false;

    try {
      const data = await getNews(targetId, limit);
      if (!cancelled) setNews(data);
    } catch (e) {
      if (!cancelled) setError(e instanceof Error ? e.message : '뉴스 불러오기 실패');
    } finally {
      if (!cancelled) setLoading(false);
    }

    return () => { cancelled = true; };
  }, [limit]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    fetchNews(filterTargetId).then((fn) => { cleanup = fn; });
    return () => { cleanup?.(); };
  }, [filterTargetId, fetchNews]);

  async function remove(id: number) {
    try {
      await deleteNews(id);
      setNews((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : '삭제 실패');
    }
  }

  return {
    news, targetOptions, filterTargetId,
    loading, error,
    setFilterTargetId, remove,
  };
}
