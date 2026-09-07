import { useState } from 'react';
import apiClient from '@/api/client';

interface Props { jobId: number; jobTitle: string; onSuccess: () => void }

export default function ApplyForm({ jobId, jobTitle, onSuccess }: Props) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', cover_letter: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) { setError('Name and email are required'); return; }
    setSubmitting(true); setError('');
    try {
      await apiClient.post('/api/applicants', { ...form, job_id: jobId, status: 'applied' });
      setSuccess(true);
      setTimeout(onSuccess, 1500);
    } catch { setError('Failed to submit application'); }
    finally { setSubmitting(false); }
  };

  if (success) return <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center text-emerald-700 font-semibold">Application submitted!</div>;

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-bold mb-1">Apply for {jobTitle}</h2>
      <p className="text-sm text-gray-500 mb-4">Fill in your details below.</p>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input name="name" placeholder="Full Name *" value={form.name} onChange={handle} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
        <input name="email" type="email" placeholder="Email *" value={form.email} onChange={handle} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
        <input name="phone" placeholder="Phone (optional)" value={form.phone} onChange={handle} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 md:col-span-2" />
      </div>
      <textarea name="cover_letter" placeholder="Cover letter (optional)" value={form.cover_letter} onChange={handle} rows={4} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 mb-4" />
      <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
        {submitting ? 'Submitting…' : 'Submit Application'}
      </button>
    </form>
  );
}