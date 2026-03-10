'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { caseStudyAPI } from '@/lib/admin-api';
import AdminLayout from '../../AdminLayout';

export default function NewCaseStudyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    challenge: '',
    solution: '',
    status: 'published',
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        challenge: formData.challenge,
        solution: formData.solution,
        status: formData.status,
        publishDate: new Date(),
      };

      const response = await caseStudyAPI.create(data);
      if (response.success) {
        router.push('/admin/case-studies');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to create case study');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/case-studies" className="text-brand-grey-500 dark:text-brand-grey-400 hover:text-brand-black dark:hover:text-white transition-colors">
            ← Back to Case Studies
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-brand-black dark:text-white mb-8">Create New Case Study</h1>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          <div className="space-y-8">
            {/* Basic Info */}
            <div className="bg-white dark:bg-brand-grey-900 p-6 rounded-lg border border-brand-grey-200 dark:border-brand-grey-800">
              <h2 className="text-lg font-semibold text-brand-black dark:text-white mb-4">Case Study Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-black dark:text-white mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setFormData(prev => ({ ...prev, title, slug: generateSlug(title) }));
                    }}
                    required
                    className="w-full px-4 py-3 border border-brand-grey-200 dark:border-brand-grey-700 bg-white dark:bg-brand-grey-800 text-brand-black dark:text-white rounded-lg focus:outline-none focus:border-accent"
                    placeholder="e.g., TechCorp: 3x Pipeline Growth"
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-brand-grey-900 p-6 rounded-lg border border-brand-grey-200 dark:border-brand-grey-800">
              <h2 className="text-lg font-semibold text-brand-black dark:text-white mb-4">Content</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-black dark:text-white mb-2">Challenge *</label>
                  <textarea
                    value={formData.challenge}
                    onChange={(e) => setFormData(prev => ({ ...prev, challenge: e.target.value }))}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-brand-grey-200 dark:border-brand-grey-700 bg-white dark:bg-brand-grey-800 text-brand-black dark:text-white rounded-lg focus:outline-none focus:border-accent"
                    placeholder="Describe the client's challenge or problem..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-black dark:text-white mb-2">Solution *</label>
                  <textarea
                    value={formData.solution}
                    onChange={(e) => setFormData(prev => ({ ...prev, solution: e.target.value }))}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-brand-grey-200 dark:border-brand-grey-700 bg-white dark:bg-brand-grey-800 text-brand-black dark:text-white rounded-lg focus:outline-none focus:border-accent"
                    placeholder="Describe the solution you provided..."
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white dark:bg-brand-grey-900 p-6 rounded-lg border border-brand-grey-200 dark:border-brand-grey-800">
              <h2 className="text-lg font-semibold text-brand-black dark:text-white mb-4">Publishing</h2>

              <div>
                <label className="block text-sm font-medium text-brand-black dark:text-white mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-3 border border-brand-grey-200 dark:border-brand-grey-700 bg-white dark:bg-brand-grey-800 text-brand-black dark:text-white rounded-lg focus:outline-none focus:border-accent"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
              <Link
                href="/admin/case-studies"
                className="px-6 py-3 border border-brand-grey-200 dark:border-brand-grey-700 text-brand-black dark:text-white rounded-lg hover:bg-brand-grey-50 dark:hover:bg-brand-grey-800 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-accent text-brand-black font-semibold rounded-lg hover:bg-accent-light transition-colors disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Case Study'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}