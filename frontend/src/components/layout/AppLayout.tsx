import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Briefcase, Compass, FileText, PlusCircle, Users, Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/', icon: Compass },
  { label: 'Jobs', href: '/jobs', icon: Briefcase },
  { label: 'Post Job', href: '/post-job', icon: PlusCircle },
  { label: 'Applicants', href: '/applicants', icon: Users },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return router.pathname === '/' || router.pathname === '/home';
    return router.pathname.startsWith(href);
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-50 text-gray-900 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static z-50 lg:z-auto w-60 h-screen flex flex-col bg-white border-r border-gray-200
        transition-transform lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="px-6 py-5 flex items-center gap-2 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
            <Briefcase className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">Talorix</span>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition ${
                  active
                    ? 'bg-red-50 text-red-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-sm font-bold">T</div>
          <div className="text-sm leading-tight">
            <div className="font-semibold">Talorix User</div>
            <div className="text-gray-400 text-xs">Hiring Manager</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto h-screen flex flex-col">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur border-b border-gray-200 px-4 md:px-8 py-4 flex items-center gap-4">
          <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <Link
            href="/post-job"
            className="px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 flex items-center gap-2 transition"
          >
            <PlusCircle className="w-4 h-4" /> Post a Job
          </Link>
        </div>

        <div className="flex-1 px-4 md:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}