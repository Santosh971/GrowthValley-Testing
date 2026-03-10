'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { blogAPI } from '@/lib/admin-api';
import AdminLayout from '../AdminLayout';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  createdAt: string;
  publishDate: string;
  author?: { name: string };
}

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadBlogs();
  }, [page, status]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const response = await blogAPI.getAll(page, 10, status);
      setBlogs(response.data || []);
      setTotal(response.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to load blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    
    try {
      await blogAPI.delete(id);
      loadBlogs();
    } catch (error) {
      alert('Failed to delete blog post');
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin" className="text-brand-grey-500 dark:text-brand-grey-400 hover:text-brand-black dark:hover:text-white transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand-black dark:text-white">Blog Posts</h1>
            <p className="text-brand-grey-500 dark:text-brand-grey-400 mt-1">{total} total posts</p>
          </div>
        <Link
          href="/admin/blog/new"
          className="px-6 py-3 bg-accent text-brand-black font-semibold rounded-lg hover:bg-accent-light transition-colors"
        >
          + New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2 border border-brand-grey-200 dark:border-brand-grey-700 bg-white dark:bg-brand-grey-900 text-brand-black dark:text-white rounded-lg focus:outline-none focus:border-accent"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-brand-grey-900 rounded-lg border border-brand-grey-200 dark:border-brand-grey-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-black dark:border-white mx-auto"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="p-8 text-center text-brand-grey-500 dark:text-brand-grey-400">
            No blog posts found. Create your first post!
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-brand-grey-50 dark:bg-brand-grey-800 border-b border-brand-grey-200 dark:border-brand-grey-700">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-brand-grey-500 dark:text-brand-grey-400">Title</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-brand-grey-500 dark:text-brand-grey-400">Category</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-brand-grey-500 dark:text-brand-grey-400">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-brand-grey-500 dark:text-brand-grey-400">Date</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-brand-grey-500 dark:text-brand-grey-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-grey-200 dark:divide-brand-grey-700">
              {blogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-brand-grey-50 dark:hover:bg-brand-grey-800">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-brand-black dark:text-white">{blog.title}</p>
                      <p className="text-sm text-brand-grey-400 dark:text-brand-grey-500">/{blog.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-brand-grey-600 dark:text-brand-grey-300">{blog.category}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      blog.status === 'published' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      blog.status === 'scheduled' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                      blog.status === 'draft' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {blog.status}
                    </span>
                    {blog.status === 'scheduled' && blog.scheduledPublishDate && (
                      <p className="text-xs text-brand-grey-400 mt-1">
                        Scheduled: {new Date(blog.scheduledPublishDate).toLocaleString()}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-brand-grey-500 dark:text-brand-grey-400">
                    {new Date(blog.publishDate || blog.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/blog/${blog._id}`}
                        className="px-3 py-1 text-sm bg-brand-grey-100 dark:bg-brand-grey-700 text-brand-black dark:text-white rounded hover:bg-brand-grey-200 dark:hover:bg-brand-grey-600 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(blog._id)}
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

      {/* Pagination */}
      {total > 10 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-brand-grey-500 dark:text-brand-grey-400">
            Showing {((page - 1) * 10) + 1} - {Math.min(page * 10, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-brand-grey-200 dark:border-brand-grey-700 text-brand-black dark:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-grey-50 dark:hover:bg-brand-grey-800"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * 10 >= total}
              className="px-4 py-2 border border-brand-grey-200 dark:border-brand-grey-700 text-brand-black dark:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-grey-50 dark:hover:bg-brand-grey-800"
            >
              Next
            </button>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}