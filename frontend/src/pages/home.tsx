import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/api/client';
import { Job } from '@/types';
import { Bookmark, Search } from 'lucide-react';

const filters = ['All', 'Remote', 'Full-time', 'Contract', 'Part-time'];
const colors = [
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700' },
  { bg: 'bg-sky-100', text: 'text-sky-700' },
];

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState<Set<number>>(new Set());

  useEffect(() => {
    apiClient.get('/api/jobs')
      .then(r => setJobs(r.data))
      .catch(() => setError('Failed to load jobs'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j => {
    const matchFilter = activeFilter === 'All' || j.type?.toLowerCase() === activeFilter.toLowerCase() || (activeFilter === 'Remote' && j.location?.toLowerCase().includes('remote'));
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalJobs = jobs.length;
  const remoteJobs = jobs.filter(j => j.location?.toLowerCase().includes('remote')).length;
  const activeJobs = jobs.filter(j => j.status === 'active' || j.status === 'open').length;

  const toggleSave = (id: number) => {
    setSaved(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <div className="px-4 sm:px-8 py-6">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white p-8 mb-6">
        <h1 className="text-3xl font-extrabold mb-1">Find work you actually want.</h1>
        <p className="text-red-100 mb-5">{totalJobs} open roles. Updated hourly.</p>
        <div className="flex flex-wrap gap-2">
          {['🔥 Remote', 'Design', 'Engineering', 'Product', 'Marketing'].map(t => (
            <span key={t} className="px-3 py-1.5 rounded-full bg-white/15 text-sm">{t}</span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { val: totalJobs, label: 'Open roles' },
          { val: remoteJobs, label: 'Remote-friendly' },
          { val: activeJobs, label: 'Active listings' },
          { val: new Set(jobs.map(j => j.company)).size, label: 'Companies hiring' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-extrabold">{s.val.toLocaleString()}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xl mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search roles, skills, companies…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-sm font-semibold text-gray-500 mr-1">Filter:</span>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm border font-medium ${
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
      {loading && <p className="text-gray-400 py-8 text-center">Loading jobs…</p>}
      {error && <p className="text-red-500 py-8 text-center">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="text-gray-400 py-8 text-center">No jobs found.</p>
      )}

      <div className="space-y-3 mb-8">
        {filtered.map((job, i) => {
          const c = colors[i % colors.length];
          const initials = job.company.slice(0, 2);
          const salary = job.salary_min && job.salary_max
            ? `$${Math.round(job.salary_min / 1000)}k–$${Math.round(job.salary_max / 1000)}k`
            : null;

          return (
            <Link href={`/jobs/${job.id}`} key={job.id}>
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-5 hover:border-red-300 hover:shadow-sm transition cursor-pointer">
                <div className={`w-12 h-12 rounded-lg ${c.bg} ${c.text} flex items-center justify-center font-bold text-lg shrink-0`}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{job.title}</h3>
                  <div className="text-sm text-gray-500 truncate">{job.company} · {job.location}</div>
                </div>
                <div className="text-right text-sm hidden md:block shrink-0">
                  {salary && <div className="font-semibold">{salary}</div>}
                  <div className="text-gray-400 text-xs">{job.type} · {timeAgo(job.created_at)}</div>
                </div>
                <button
                  type="button"
                  onClick={e => { e.preventDefault(); toggleSave(job.id); }}
                  className={`p-2 rounded-lg hover:bg-gray-100 shrink-0 ${saved.has(job.id) ? 'text-red-600' : 'text-gray-400'}`}
                >
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>
            </Link>
          );
        })}
      </div>

      <footer className="text-center text-xs text-gray-400 pb-8">
        © 2024 Talorix ·{' '}
        <Link href="/jobs" className="hover:text-gray-600">Jobs</Link> ·{' '}
        <Link href="/post-job" className="hover:text-gray-600">Post a Job</Link> ·{' '}
        <Link href="/applicants" className="hover:text-gray-600">Applicants</Link>
      </footer>
    </div>
  );
}