import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import apiClient from '@/api/client';
import { Job } from '@/types';
import { Search, Bookmark, MapPin, Clock, DollarSign } from 'lucide-react';

const FILTER_OPTIONS = ['All', 'Remote', 'Full-time', 'Part-time', 'Contract'];

const COLOR_MAP: Record<number, { bg: string; text: string }> = {
  0: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  1: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  2: { bg: 'bg-orange-100', text: 'text-orange-700' },
  3: { bg: 'bg-rose-100', text: 'text-rose-700' },
  4: { bg: 'bg-sky-100', text: 'text-sky-700' },
};

function getColor(index: number) {
  return COLOR_MAP[index % 5];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatSalary(min?: number, max?: number) {
  if (!min && !max) return null;
  const fmt = (n: number) => n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [saved, setSaved] = useState<Set<number>>(new Set());

  useEffect(() => {
    apiClient.get('/api/jobs')
      .then(res => setJobs(res.data))
      .catch(() => setError('Failed to load jobs'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = jobs;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q)
      );
    }
    if (activeFilter !== 'All') {
      const f = activeFilter.toLowerCase();
      result = result.filter(j => {
        if (f === 'remote') return j.location.toLowerCase().includes('remote');
        return j.type.toLowerCase().replace('-', '') === f.replace('-', '');
      });
    }
    return result;
  }, [jobs, search, activeFilter]);

  const toggleSave = (id: number) => {
    setSaved(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const stats = useMemo(() => ({
    total: jobs.length,
    remote: jobs.filter(j => j.location.toLowerCase().includes('remote')).length,
    active: jobs.filter(j => j.status === 'active' || j.status === 'open').length,
    companies: new Set(jobs.map(j => j.company)).size,
  }), [jobs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-red-500 font-medium">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 py-6">
      {/* Search */}
      <div className="relative max-w-xl mb-6">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search roles, skills, companies…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Jobs', value: stats.total },
          { label: 'Remote-friendly', value: stats.remote },
          { label: 'Active Roles', value: stats.active },
          { label: 'Companies', value: stats.companies },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-extrabold">{s.value.toLocaleString()}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-sm font-semibold text-gray-500 mr-1">Filter:</span>
        {FILTER_OPTIONS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm border font-medium transition ${
              activeFilter === f
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Job list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No jobs match your criteria.</div>
      ) : (
        <div className="space-y-3 mb-8">
          {filtered.map((job, i) => {
            const color = getColor(i);
            const salary = formatSalary(job.salary_min, job.salary_max);
            return (
              <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-5 hover:border-red-300 hover:shadow-sm transition">
                <Link href={`/jobs/${job.id}`} className="flex items-center gap-5 flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-lg ${color.bg} ${color.text} flex items-center justify-center font-bold text-lg shrink-0`}>
                    {job.company.substring(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold truncate">{job.title}</h3>
                      {job.status === 'active' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium shrink-0">Active</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      {job.company} · <MapPin className="w-3 h-3" /> {job.location}
                    </div>
                  </div>
                </Link>
                <div className="text-right text-sm hidden md:block shrink-0">
                  {salary && <div className="font-semibold flex items-center gap-1 justify-end"><DollarSign className="w-3 h-3" />{salary.replace('$','')}</div>}
                  <div className="text-gray-400 text-xs flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" />{job.type} · {timeAgo(job.created_at)}
                  </div>
                </div>
                <button
                  onClick={() => toggleSave(job.id)}
                  className={`p-2 rounded-lg hover:bg-gray-100 transition ${saved.has(job.id) ? 'text-red-600' : 'text-gray-400'}`}
                >
                  <Bookmark className="w-5 h-5" fill={saved.has(job.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}