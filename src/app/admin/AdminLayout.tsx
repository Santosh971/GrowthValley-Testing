'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useLogo } from '@/lib/settings-context';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Content', href: '/admin/content', icon: '📄' },
  { name: 'Blog Posts', href: '/admin/blog', icon: '📝' },
  // { name: 'Case Studies', href: '/admin/case-studies', icon: '💼' },
  { name: 'Testimonials', href: '/admin/testimonials', icon: '⭐' },
  { name: 'Team', href: '/admin/team', icon: '👥' },
  { name: 'Enquiries', href: '/admin/enquiries', icon: '📧' },
  { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
  { name: 'View Site', href: '/', icon: '🌐', external: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, loading } = useAuth();
  const { logo: adminLogo, hasLogo, siteName } = useLogo();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-grey-50 dark:bg-brand-grey-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-black dark:border-white mx-auto mb-4"></div>
          <p className="text-brand-grey-500 dark:text-brand-grey-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return (
      <div className="min-h-screen bg-brand-grey-50 dark:bg-brand-grey-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-brand-grey-500 dark:text-brand-grey-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-brand-grey-50 dark:bg-brand-grey-950">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-brand-black text-white flex flex-col z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Hamburger/Close button - visible only on mobile */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden absolute top-4 left-4 p-2 rounded-lg hover:bg-brand-grey-800 transition-colors text-white z-10"
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          {sidebarOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
        {/* Logo */}
        <div className="h-16 lg:h-24 flex items-center justify-center border-b border-brand-grey-800 px-4">
          <Link href="/admin" className="flex items-center justify-center w-full">
            {hasLogo && adminLogo ? (
              <img
                src={adminLogo}
                alt={siteName || 'Logo'}
                className="h-10 lg:h-16 w-auto max-w-full object-contain"
              />
            ) : (
              <span className="text-lg lg:text-xl font-bold text-white text-center">
                {siteName?.split(' ')[0] || 'Admin'}<span className="text-accent">{siteName?.split(' ')[1] || ''}</span>
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/admin' && pathname?.startsWith(item.href));

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-colors text-sm lg:text-base ${isActive
                        ? 'bg-accent text-brand-black font-medium'
                        : 'text-brand-grey-300 hover:bg-brand-grey-800 hover:text-white'
                      }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-3 lg:p-4 border-t border-brand-grey-800">
          <div className="flex items-center justify-between">
            <div className="overflow-hidden mr-2">
              <div className="text-xs lg:text-sm font-medium truncate">{user?.name || 'Admin'}</div>
              <div className="text-xs text-brand-grey-400 truncate">{user?.email}</div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-brand-grey-400 hover:text-white transition-colors rounded-lg hover:bg-brand-grey-800 flex-shrink-0"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white dark:bg-brand-grey-900 border-b border-brand-grey-200 dark:border-brand-grey-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-brand-grey-100 dark:hover:bg-brand-grey-800 transition-colors text-brand-black dark:text-white"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="font-medium text-brand-black dark:text-white">Admin Panel</span>
            <Link
              href="/"
              className="p-2 rounded-lg hover:bg-brand-grey-100 dark:hover:bg-brand-grey-800 transition-colors text-brand-black dark:text-white"
              aria-label="Home"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}