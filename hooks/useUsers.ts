'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User, UserFormValues, UserInsertPayload, UserUpdatePayload } from '../types';
import { getUsers, createUser, updateUser, deleteUser } from '../services/userService';

const EMPTY_FORM: UserFormValues = {
  user_nm: '',
  user_id: '',
  age: '',
  birthday_dtm: '',
  password: '',
  email: '',
  slack_webhook_url: '',
};

/** User → edit form initial values */
function toFormValues(user: User): UserFormValues {
  return {
    user_nm: user.user_nm,
    user_id: user.user_id,
    age: user.age ? String(user.age) : '',
    birthday_dtm: user.birthday_dtm
      ? new Date(user.birthday_dtm).toISOString().split('T')[0]
      : '',
    password: '',
    email: user.email ?? '',
    slack_webhook_url: user.slack_webhook_url ?? '',
  };
}

function validate(form: UserFormValues, isNew: boolean): string | null {
  if (!form.user_nm || !form.user_id) return '이름과 아이디는 필수입니다.';
  if (isNew && !form.password) return '신규 등록 시 비밀번호는 필수입니다.';
  return null;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [form, setForm] = useState<UserFormValues>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await getUsers());
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

  function startEdit(user: User) {
    setForm(toFormValues(user));
    setEditingId(user.id);
    setFormError(null);
  }

  function cancel() {
    setEditingId(null);
    setFormError(null);
  }

  function setField(field: keyof UserFormValues, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function save() {
    const isNew = editingId === 'new';
    const validationError = validate(form, isNew);
    if (validationError) { setFormError(validationError); return; }
    setFormError(null);

    try {
      if (isNew) {
        const payload: UserInsertPayload = {
          user_nm: form.user_nm,
          user_id: form.user_id,
          age: form.age ? parseInt(form.age, 10) : null,
          birthday_dtm: form.birthday_dtm || null,
          password: form.password,
          email: form.email || null,
          slack_webhook_url: form.slack_webhook_url || null,
        };
        await createUser(payload);
      } else {
        const payload: UserUpdatePayload = {
          user_nm: form.user_nm,
          user_id: form.user_id,
          age: form.age ? parseInt(form.age, 10) : null,
          birthday_dtm: form.birthday_dtm || null,
          email: form.email || null,
          slack_webhook_url: form.slack_webhook_url || null,
          ...(form.password ? { password: form.password } : {}),
        };
        await updateUser(editingId!, payload);
      }
      setEditingId(null);
      await refresh();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : '저장 실패');
    }
  }

  async function remove(id: number) {
    try {
      await deleteUser(id);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : '삭제 실패');
    }
  }

  return {
    users, loading, error,
    editingId, form, formError,
    refresh, startNew, startEdit, cancel, setField, save, remove,
  };
}
