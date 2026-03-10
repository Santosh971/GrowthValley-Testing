'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { contentAPI } from '@/lib/admin-api';
import AdminLayout from '../AdminLayout';

interface PageSummary {
  page: string;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
  };
  updatedAt: string | null;
  exists: boolean;
}

const pageInfo: Record<string, { name: string; description: string }> = {
  home: { name: 'Home', description: 'Main landing page hero, stats, solutions, industries, and CTA sections' },
  company: { name: 'Company (About)', description: 'Company/About page mission, origin, values, and approach' },
  services: { name: 'Services', description: 'Services/solutions offered with features and outcomes' },
  industries: { name: 'Industries', description: 'Industry expertise pages with challenges and results' },
  casestudies: { name: 'Case Studies', description: 'Case studies page header and CTA sections' },
  contact: { name: 'Contact', description: 'Contact page form, info, and expectations' },
  privacy: { name: 'Privacy Policy', description: 'Privacy policy page with legal content and sections' },
  terms: { name: 'Terms & Conditions', description: 'Terms and conditions page with legal agreements' },
};

export default function ContentManagementPage() {
  const [pages, setPages] = useState<PageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      const response = await contentAPI.getAllPages();
      if (response.success) {
        setPages(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPageInfo = (pageKey: string) => {
    return pageInfo[pageKey] || { name: pageKey.charAt(0).toUpperCase() + pageKey.slice(1), description: 'Custom page content' };
  };

  return (
    <AdminLayout>
      <div className="p-8">


        <div className="mb-6 sm:mb-8 flex flex-col-reverse sm:flex-row items-start sm:items-center justify-between">
          {/* Content Title + Description */}
          <div className="mt-3 sm:mt-0">
            <h1 className="text-2xl sm:text-heading-1 text-brand-black dark:text-white mb-1 sm:mb-2">
              Content Management
            </h1>
            <p className="text-sm sm:text-body text-brand-grey-500 dark:text-brand-grey-400">
              Manage all page content dynamically. Edit sections, update text, and customize your site.
            </p>
          </div>

          {/* Back to Dashboard Link */}
          <Link
            href="/admin"
            className="mb-2 sm:mb-0 px-3 sm:px-4 py-2 sm:py-2.5 border border-brand-grey-300 dark:border-brand-grey-700 text-sm sm:text-base text-brand-black dark:text-white rounded-lg hover:border-accent transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4 sm:w-4 sm:h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
              />
            </svg>
            Back to Dashboard
          </Link>
        </div>
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="animate-pulse">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-40 bg-brand-grey-200 dark:bg-brand-grey-800 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          /* Pages Grid */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pages.filter((page) => page.exists).map((page) => {
              const info = getPageInfo(page.page);
              return (
                <Link
                  key={page.page}
                  href={`/admin/content/${page.page}`}
                  className="block bg-white dark:bg-brand-grey-900 border border-brand-grey-200 dark:border-brand-grey-800 rounded-lg p-6 hover:border-accent transition-colors group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-heading-4 text-brand-black dark:text-white group-hover:text-accent transition-colors">
                          {info.name}
                        </h3>
                        {!page.exists && (
                          <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded">
                            Not initialized
                          </span>
                        )}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-brand-grey-400 group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>

                  <p className="text-body-sm text-brand-grey-500 dark:text-brand-grey-400 mb-4 line-clamp-2">
                    {info.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-brand-grey-400 dark:text-brand-grey-500">
                    <span>Updated: {formatDate(page.updatedAt)}</span>
                    {page.seo?.metaTitle && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        SEO set
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 p-6 bg-brand-grey-50 dark:bg-brand-grey-900 border border-brand-grey-200 dark:border-brand-grey-800 rounded-lg">
          <h2 className="text-heading-4 text-brand-black dark:text-white mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={async () => {
                try {
                  const response = await contentAPI.initializeDefaults();
                  if (response.success) {
                    alert(`Initialized ${response.data.count} pages with default content`);
                    loadPages();
                  }
                } catch (err: any) {
                  alert(err.message || 'Failed to initialize defaults');
                }
              }}
              className="px-4 py-2 bg-accent text-brand-black rounded-lg hover:bg-accent/90 transition-colors"
            >
              Initialize All Defaults
            </button>
            <Link
              href="/"
              target="_blank"
              className="px-4 py-2 border border-brand-grey-300 dark:border-brand-grey-700 text-brand-black dark:text-white rounded-lg hover:border-accent transition-colors"
            >
              View Live Site
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}