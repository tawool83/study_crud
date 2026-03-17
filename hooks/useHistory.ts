'use client';

import { useState, useEffect, useCallback } from 'react';
import type { RunHistory } from '../types';
import { getRunHistory } from '../services/historyService';

export function useHistory(limit = 100) {
  const [rows, setRows] = useState<RunHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await getRunHistory(limit));
    } catch (e) {
      setError(e instanceof Error ? e.message : '불러오기 실패');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { refresh(); }, [refresh]);

  return { rows, loading, error, refresh };
}
