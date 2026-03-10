'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { caseStudyAPI } from '@/lib/admin-api';
import { useAuth } from '@/lib/auth-context';
import AdminLayout from '../AdminLayout';

interface CaseStudy {
  _id: string;
  title: string;
  slug: string;
  challenge?: string;
  status: string;
}

export default function CaseStudiesListPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) loadCaseStudies();
  }, [isAuthenticated]);

  const loadCaseStudies = async () => {
    try {
      const response = await caseStudyAPI.getAll();
      setCaseStudies(response.data || []);
    } catch (error) {
      console.error('Failed to load case studies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this case study?')) return;

    try {
      await caseStudyAPI.delete(id);
      loadCaseStudies();
    } catch (error) {
      alert('Failed to delete case study');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-black dark:border-white"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin" className="text-brand-grey-500 dark:text-brand-grey-400 hover:text-brand-black dark:hover:text-white transition-colors">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8">
          <div className="mb-3 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-black dark:text-white">
              Case Studies
            </h1>
            <p className="text-sm sm:text-base text-brand-grey-500 dark:text-brand-grey-400 mt-1">
              {caseStudies.length} total
            </p>
          </div>
          <Link
            href="/admin/case-studies/new"
            className="px-4 sm:px-6 py-2 sm:py-3 bg-accent text-brand-black font-semibold rounded-lg hover:bg-accent-light transition-colors text-sm sm:text-base"
          >
            + New Case Study
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-brand-grey-900 rounded-lg border border-brand-grey-200 dark:border-brand-grey-800 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-black dark:border-white mx-auto"></div>
            </div>
          ) : caseStudies.length === 0 ? (
            <div className="p-8 text-center text-brand-grey-500 dark:text-brand-grey-400">
              No case studies found. Create your first one!
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-brand-grey-50 dark:bg-brand-grey-800 border-b border-brand-grey-200 dark:border-brand-grey-700">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-brand-grey-500 dark:text-brand-grey-400">Title</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-brand-grey-500 dark:text-brand-grey-400">Challenge</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-brand-grey-500 dark:text-brand-grey-400">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-brand-grey-500 dark:text-brand-grey-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-grey-200 dark:divide-brand-grey-700">
                {caseStudies.map((cs) => (
                  <tr key={cs._id} className="hover:bg-brand-grey-50 dark:hover:bg-brand-grey-800">
                    <td className="px-6 py-4">
                      <p className="font-medium text-brand-black dark:text-white">{cs.title}</p>
                    </td>
                    <td className="px-6 py-4 text-brand-grey-600 dark:text-brand-grey-300 max-w-md truncate">
                      {cs.challenge?.substring(0, 80)}...
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${cs.status === 'published' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        }`}>
                        {cs.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/case-studies/${cs._id}`}
                          className="px-3 py-1 text-sm bg-brand-grey-100 dark:bg-brand-grey-700 text-brand-black dark:text-white rounded hover:bg-brand-grey-200 dark:hover:bg-brand-grey-600 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(cs._id)}
                          className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}