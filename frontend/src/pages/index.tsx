import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/api/client';
import { Job } from '@/types';

const FILTER_OPTIONS = ['All', 'Remote', 'Full-time', 'Contract', 'Part-time'];
const COLORS = [
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700' },
  { bg: 'bg-sky-100', text: 'text-sky-700' },
];

function getInitials(name: string) {
  return name.slice(0, 2);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    apiClient.get('/api/jobs')
      .then(res => setJobs(res.data))
      .catch(() => setError('Failed to load jobs'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j => {
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === 'All' ||
      (activeFilter === 'Remote' && j.location.toLowerCase().includes('remote')) ||
      j.type.toLowerCase() === activeFilter.toLowerCase();
    return matchSearch && matchFilter;
  });

  const totalJobs = jobs.length;
  const remoteJobs = jobs.filter(j => j.location.toLowerCase().includes('remote')).length;
  const avgSalary = jobs.length ? Math.round(jobs.reduce((s, j) => s + ((j.salary_min || 0) + (j.salary_max || 0)) / 2, 0) / jobs.length / 1000) : 0;
  const companies = new Set(jobs.map(j => j.company)).size;

  return (
    <div>
      {/* Search bar */}
      <div className="mb-6 max-w-xl relative">
        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input
          type="text"
          placeholder="Search roles, skills, companies…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-8 mb-6">
        <h1 className="text-3xl font-extrabold mb-1">Find work you actually want.</h1>
        <p className="text-indigo-100 mb-5">Browse open roles from vetted companies. Updated hourly.</p>
        <div className="flex flex-wrap gap-2">
          {['🔥 Remote', 'Design', 'Engineering', 'Product', 'Marketing'].map(t => (
            <span key={t} className="px-3 py-1.5 rounded-full bg-white/15 text-sm">{t}</span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { val: totalJobs.toLocaleString(), label: 'Open roles' },
          { val: remoteJobs.toLocaleString(), label: 'Remote-friendly' },
          { val: `$${avgSalary}k`, label: 'Avg comp' },
          { val: companies.toLocaleString(), label: 'Companies hiring' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-extrabold">{s.val}</div>
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
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Job list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading jobs…</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No jobs found.</div>
      ) : (
        <div className="space-y-3 mb-8">
          {filtered.map((job, i) => {
            const c = COLORS[i % COLORS.length];
            return (
              <Link href={`/jobs/${job.id}`} key={job.id} className="block">
                <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-5 hover:border-indigo-300 hover:shadow-sm transition cursor-pointer">
                  <div className={`w-12 h-12 rounded-lg ${c.bg} ${c.text} flex items-center justify-center font-bold text-lg shrink-0`}>
                    {getInitials(job.company)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold truncate">{job.title}</h3>
                      {job.status === 'active' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium shrink-0">New</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 truncate">{job.company} · {job.location}</div>
                  </div>
                  <div className="text-right text-sm hidden md:block shrink-0">
                    {(job.salary_min || job.salary_max) && (
                      <div className="font-semibold">
                        {job.salary_min ? `$${Math.round(job.salary_min / 1000)}k` : ''}
                        {job.salary_min && job.salary_max ? '–' : ''}
                        {job.salary_max ? `$${Math.round(job.salary_max / 1000)}k` : ''}
                      </div>
                    )}
                    <div className="text-gray-400 text-xs">{job.type} · {timeAgo(job.created_at)}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <footer className="text-center text-xs text-gray-400 pb-8">
        © 2024 Talorix · <Link href="/jobs" className="hover:text-gray-600">Jobs</Link> · <Link href="/applicants" className="hover:text-gray-600">Applicants</Link> · <Link href="/post-job" className="hover:text-gray-600">Post a Job</Link>
      </footer>
    </div>
  );
}