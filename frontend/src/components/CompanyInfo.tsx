import { FiMapPin, FiClock, FiCalendar } from 'react-icons/fi';

interface Props { company: string; location: string; type: string; createdAt: string }

export default function CompanyInfo({ company, location, type, createdAt }: Props) {
  const posted = new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <h2 className="text-lg font-bold">Company Info</h2>
      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">{company.slice(0,2)}</div><span className="font-semibold text-gray-900">{company}</span></div>
        <div className="flex items-center gap-2"><FiMapPin className="w-4 h-4 text-gray-400" />{location}</div>
        <div className="flex items-center gap-2"><FiClock className="w-4 h-4 text-gray-400" />{type}</div>
        <div className="flex items-center gap-2"><FiCalendar className="w-4 h-4 text-gray-400" />Posted {posted}</div>
      </div>
    </div>
  );
}