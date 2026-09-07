import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import apiClient from '@/api/client';
import { Job } from '@/types';
import JobDescription from '@/components/JobDescription';
import ApplyForm from '@/components/ApplyForm';
import CompanyInfo from '@/components/CompanyInfo';
import Link from 'next/link';
import { FiArrowLeft, FiMapPin, FiClock, FiDollarSign, FiBriefcase } from 'react-icons/fi';

export default function JobDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApply, setShowApply] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient.get(`/api/jobs/${id}`)
      .then(res => setJob(res.data))
      .catch(() => setError('Failed to load job'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="px-8 py-12 text-center">
        <p className="text-gray-500 mb-4">{error || 'Job not found'}</p>
        <Link href="/jobs" className="text-indigo-600 font-semibold hover:underline">← Back to Jobs</Link>
      </div>
    );
  }

  const salary = job.salary_min || job.salary_max
    ? `$${job.salary_min ? (job.salary_min / 1000).toFixed(0) + 'k' : '?'} – $${job.salary_max ? (job.salary_max / 1000).toFixed(0) + 'k' : '?'}`
    : null;

  const initials = job.company.slice(0, 2);
  const colors = ['bg-emerald-100 text-emerald-700', 'bg-indigo-100 text-indigo-700', 'bg-orange-100 text-orange-700', 'bg-rose-100 text-rose-700', 'bg-sky-100 text-sky-700'];
  const colorClass = colors[(job.id ?? 0) % colors.length];

  return (
    <div className="px-4 md:px-8 py-6 max-w-4xl mx-auto">
      <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-6">
        <FiArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold text-lg shrink-0 ${colorClass}`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-extrabold mb-1">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
              <span className="flex items-center gap-1"><FiBriefcase className="w-3.5 h-3.5" /> {job.company}</span>
              <span className="flex items-center gap-1"><FiMapPin className="w-3.5 h-3.5" /> {job.location}</span>
              <span className="flex items-center gap-1"><FiClock className="w-3.5 h-3.5" /> {job.type}</span>
              {salary && <span className="flex items-center gap-1"><FiDollarSign className="w-3.5 h-3.5" /> {salary}</span>}
            </div>
            <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${job.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
              {job.status}
            </span>
          </div>
          <button
            onClick={() => setShowApply(!showApply)}
            className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 shrink-0"
          >
            {showApply ? 'Cancel' : 'Apply Now'}
          </button>
        </div>
      </div>

      {showApply && (
        <div className="mb-6">
          <ApplyForm jobId={job.id} jobTitle={job.title} onSuccess={() => setShowApply(false)} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <JobDescription description={job.description} />
        </div>
        <div>
          <CompanyInfo company={job.company} location={job.location} type={job.type} createdAt={job.created_at} />
        </div>
      </div>
    </div>
  );
}