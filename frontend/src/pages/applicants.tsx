import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/api/client';
import { Applicant } from '@/types';
import { Search, Filter, ChevronDown, X, User, Mail, Phone, FileText, Briefcase } from 'lucide-react';

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
  reviewing: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
  interviewed: { bg: 'bg-violet-50 border-violet-200', text: 'text-violet-700' },
  accepted: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  rejected: { bg: 'bg-red-50 border-red-200', text: 'text-red-700' },
};

function getStatusStyle(status: string) {
  return statusColors[status?.toLowerCase()] || statusColors.pending;
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const initialsColors = [
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700' },
  { bg: 'bg-sky-100', text: 'text-sky-700' },
];

function getColor(id: number) {
  return initialsColors[id % initialsColors.length];
}

export default function Applicants() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState<any | null>(null);

  const fetchApplicants = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/api/applicants');
      setApplicants(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load applicants.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApplicants(); }, [fetchApplicants]);

  const statuses = ['All', ...Array.from(new Set(applicants.map(a => a.status)))];

  const filtered = applicants.filter(a => {
    const matchSearch = a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.job_title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await apiClient.put(`/api/applicants/${id}`, { status: newStatus });
      setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
      if (selected?.id === id) setSelected((s: any) => ({ ...s, status: newStatus }));
    } catch { /* ignore */ }
  };

  return (
    <div className="px-8 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Applicants</h1>
          <p className="text-sm text-gray-400 mt-0.5">{applicants.length} total applicants</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: applicants.length },
          { label: 'Pending', value: applicants.filter(a => a.status === 'pending').length },
          { label: 'Accepted', value: applicants.filter(a => a.status === 'accepted').length },
          { label: 'Rejected', value: applicants.filter(a => a.status === 'rejected').length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-extrabold">{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search applicants…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400" />
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-sm border font-medium transition ${
                  statusFilter === s
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading…</div>
        ) : error ? (
          <div className="p-12 text-center text-red-500 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No applicants found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Applicant</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Job</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Contact</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Applied</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const c = getColor(a.id);
                  const st = getStatusStyle(a.status);
                  return (
                    <tr
                      key={a.id}
                      onClick={() => setSelected(a)}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${c.bg} ${c.text} flex items-center justify-center font-bold text-sm`}>
                            {getInitials(a.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{a.name}</div>
                            <div className="text-xs text-gray-400 md:hidden">{a.job_title || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600 hidden md:table-cell">{a.job_title || '—'}</td>
                      <td className="px-5 py-4 text-gray-500 hidden lg:table-cell">{a.email}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${st.bg} ${st.text}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-gray-400 text-xs hidden sm:table-cell">
                        {a.applied_at ? new Date(a.applied_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSelected(null)} />
          <div className="fixed top-0 right-0 h-full w-full sm:w-[560px] lg:w-[680px] max-w-full bg-white shadow-xl z-50 flex flex-col">
            {/* Gradient Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-6">
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-1.5 rounded hover:bg-white/20">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl ${getColor(selected.id).bg} ${getColor(selected.id).text} flex items-center justify-center font-bold text-xl`}>
                  {getInitials(selected.name)}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold">{selected.name}</h2>
                  <p className="text-indigo-100 text-sm">{selected.job_title || 'Applicant'}</p>
                </div>
              </div>
              <div className="mt-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20`}>
                  {selected.status}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {['pending', 'reviewing', 'interviewed', 'accepted', 'rejected'].map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatusUpdate(selected.id, s)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                      selected.status === s
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{selected.email}</span>
                </div>
                {selected.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{selected.phone}</span>
                  </div>
                )}
                {selected.resume_url && (
                  <div className="flex items-center gap-3 text-sm">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <a href={selected.resume_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                      View Resume
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Applied {selected.applied_at ? new Date(selected.applied_at).toLocaleDateString() : '—'}</span>
                </div>
              </div>

              {/* Cover Letter */}
              {selected.cover_letter && (
                <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Cover Letter</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.cover_letter}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}