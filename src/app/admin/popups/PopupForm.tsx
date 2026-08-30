'use client';

import { useState } from 'react';
import type { Popup } from '../../../types';
import { createSupabaseBrowserClient } from '../../../lib/supabase-browser';

interface PopupFormProps {
  popup?: Popup;
  onSuccess: () => void;
}

const CITIES = ['Raleigh', 'Durham', 'Chapel Hill', 'Other'] as const;

const EMPTY: Omit<Popup, 'id'> = {
  title: '',
  startsAt: '',
  endsAt: '',
  venueName: '',
  address: '',
  city: 'Durham',
  notes: '',
  preordersEnabled: true,
  preorderCutoff: '',
  status: 'scheduled',
  isPublic: true,
};

export default function PopupForm({ popup, onSuccess }: PopupFormProps) {
  const isEdit = !!popup;
  const [form, setForm] = useState<Omit<Popup, 'id'>>(
    popup ? { ...popup } : EMPTY,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? '';
      const url = isEdit ? `/api/admin/popups/${popup!.id}` : '/api/admin/popups';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error ?? 'Failed to save.');
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!popup) return;
    if (!confirm(`Delete "${popup.title}"? This cannot be undone.`)) return;
    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? '';
      await fetch(`/api/admin/popups/${popup.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      onSuccess();
    } catch {
      setError('Failed to delete.');
    } finally {
      setSaving(false);
    }
  }

  const inputCls = 'w-full border border-lilac rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple';
  const labelCls = 'block text-sm font-medium text-ink mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div>
        <label className={labelCls} htmlFor="pf-title">Title <span className="text-purple">*</span></label>
        <input id="pf-title" type="text" required className={inputCls} value={form.title}
          onChange={(e) => set('title', e.target.value)} placeholder="Durham Farmers Market" />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelCls} htmlFor="pf-starts">Start time <span className="text-purple">*</span></label>
          <input id="pf-starts" type="datetime-local" required className={inputCls}
            value={form.startsAt.slice(0, 16)}
            onChange={(e) => set('startsAt', e.target.value + ':00')} />
        </div>
        <div>
          <label className={labelCls} htmlFor="pf-ends">End time <span className="text-purple">*</span></label>
          <input id="pf-ends" type="datetime-local" required className={inputCls}
            value={form.endsAt.slice(0, 16)}
            onChange={(e) => set('endsAt', e.target.value + ':00')} />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="pf-venue">Venue name <span className="text-purple">*</span></label>
        <input id="pf-venue" type="text" required className={inputCls} value={form.venueName}
          onChange={(e) => set('venueName', e.target.value)} />
      </div>

      <div>
        <label className={labelCls} htmlFor="pf-address">Full address <span className="text-purple">*</span></label>
        <input id="pf-address" type="text" required className={inputCls} value={form.address}
          onChange={(e) => set('address', e.target.value)} placeholder="123 Main St, Durham, NC 27701" />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelCls} htmlFor="pf-city">City <span className="text-purple">*</span></label>
          <select id="pf-city" className={inputCls} value={form.city}
            onChange={(e) => set('city', e.target.value as Popup['city'])}>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="pf-status">Status</label>
          <select id="pf-status" className={inputCls} value={form.status}
            onChange={(e) => set('status', e.target.value as Popup['status'])}>
            <option value="scheduled">Scheduled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="pf-cutoff">Pre-order cutoff <span className="text-purple">*</span></label>
        <input id="pf-cutoff" type="datetime-local" required className={inputCls}
          value={form.preorderCutoff.slice(0, 16)}
          onChange={(e) => set('preorderCutoff', e.target.value + ':00')} />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" className="accent-purple w-4 h-4"
          checked={form.preordersEnabled}
          onChange={(e) => set('preordersEnabled', e.target.checked)} />
        <span className="text-sm font-medium text-ink">Pre-orders enabled</span>
      </label>

      <div className="bg-lilac/20 rounded-xl p-4 flex items-start gap-3">
        <button
          type="button"
          onClick={() => set('isPublic', !form.isPublic)}
          className={`shrink-0 w-11 h-6 rounded-full relative transition-colors ${form.isPublic ? 'bg-purple' : 'bg-lilac'}`}
          aria-pressed={form.isPublic}
        >
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.isPublic ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
        <div>
          <p className="text-sm font-medium text-ink">
            {form.isPublic ? 'Public popup' : 'Private popup'}
          </p>
          <p className="text-xs text-ink/50 mt-0.5">
            {form.isPublic
              ? 'Visible on the homepage and schedule page.'
              : 'Only visible in admin - for partner communities.'}
          </p>
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="pf-notes">Notes <span className="text-ink/40">(optional)</span></label>
        <textarea id="pf-notes" rows={2} className={inputCls + ' resize-none'} value={form.notes ?? ''}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Entry instructions, parking, etc." />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>}

      <div className="flex items-center justify-between gap-4 pt-2">
        {isEdit && (
          <button type="button" onClick={handleDelete} disabled={saving}
            className="text-sm text-red-500 hover:underline disabled:opacity-40">
            Delete popup
          </button>
        )}
        <button type="submit" disabled={saving}
          className="ml-auto px-6 py-3 bg-purple text-white font-semibold rounded-xl hover:bg-purple-deep disabled:opacity-40 transition-colors">
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create popup'}
        </button>
      </div>
    </form>
  );
}

