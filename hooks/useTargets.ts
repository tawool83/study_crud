'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CrawlTarget, TargetFormValues, TargetPayload } from '../types';
import {
  getTargets,
  createTarget,
  updateTarget,
  deleteTarget,
} from '../services/targetService';

const EMPTY_FORM: TargetFormValues = {
  name: '',
  target_url: '',
  row_selector: '',
  title_selector: '',
  date_selector: '',
  author_selector: '',
  page_param: 'page',
  keywords: '',
  is_active: true,
};

/** TargetFormValues → DB payload */
function toPayload(form: TargetFormValues): TargetPayload {
  return {
    name: form.name,
    target_url: form.target_url,
    row_selector: form.row_selector,
    title_selector: form.title_selector,
    date_selector: form.date_selector,
    author_selector: form.author_selector || null,
    page_param: form.page_param || 'page',
    keywords: form.keywords
      ? form.keywords.split(',').map((k) => k.trim()).filter(Boolean)
      : [],
    is_active: form.is_active,
  };
}

/** CrawlTarget → edit form initial values */
function toFormValues(target: CrawlTarget): TargetFormValues {
  return {
    name: target.name,
    target_url: target.target_url,
    row_selector: target.row_selector,
    title_selector: target.title_selector,
    date_selector: target.date_selector,
    author_selector: target.author_selector ?? '',
    page_param: target.page_param,
    keywords: (target.keywords ?? []).join(', '),
    is_active: target.is_active,
  };
}

function validate(form: TargetFormValues): string | null {
  if (!form.name || !form.target_url || !form.row_selector || !form.title_selector || !form.date_selector) {
    return '이름, URL, row/title/date 셀렉터는 필수입니다.';
  }
  return null;
}

export function useTargets() {
  const [targets, setTargets] = useState<CrawlTarget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [form, setForm] = useState<TargetFormValues>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setTargets(await getTargets());
    } catch (e) {
      setError(e instanceof Error ? e.message : '불러오기 실패');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  function startNew() {
    setForm(EMPTY_FORM);
    setEditingId('new');
    setFormError(null);
  }

  function startEdit(target: CrawlTarget) {
    setForm(toFormValues(target));
    setEditingId(target.id);
    setFormError(null);
  }

  function cancel() {
    setEditingId(null);
    setFormError(null);
  }

  function setField(field: keyof TargetFormValues, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function save() {
    const validationError = validate(form);
    if (validationError) { setFormError(validationError); return; }
    setFormError(null);

    try {
      if (editingId === 'new') {
        await createTarget(toPayload(form));
      } else {
        await updateTarget(editingId!, toPayload(form));
      }
      setEditingId(null);
      await refresh();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : '저장 실패');
    }
  }

  async function remove(id: number) {
    try {
      await deleteTarget(id);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : '삭제 실패');
    }
  }

  return {
    targets, loading, error,
    editingId, form, formError,
    refresh, startNew, startEdit, cancel, setField, save, remove,
  };
}
