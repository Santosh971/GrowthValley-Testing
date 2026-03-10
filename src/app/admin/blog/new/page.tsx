'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { blogAPI, mediaAPI } from '@/lib/admin-api';
import AdminLayout from '../../AdminLayout';
import ContentBlocksEditor, { ContentBlock } from '@/components/admin/ContentBlocksEditor';

const categories = ['Strategy', 'Automation', 'Performance', 'Technology', 'Growth', 'General'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function NewBlogPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    contentBlocks: [] as ContentBlock[],
    category: 'General',
    tags: '',
    status: 'draft',
    featured: false,
    featuredImage: '',
    featuredImageAlt: '',
    scheduledPublishDate: '',
    scheduledPublishTime: '',
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: '',
    },
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const validateImage = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload a JPG, JPEG, PNG, or WebP image.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 5MB. Please upload a smaller image.';
    }
    return null;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);
    const error = validateImage(file);
    if (error) {
      setImageError(error);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async (): Promise<string | null> => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return null;

    setUploadingImage(true);
    try {
      const response = await mediaAPI.upload(file, 'blog');
      if (response.success && response.data?.url) {
        return response.data.url;
      }
      throw new Error('Failed to upload image');
    } catch (error: any) {
      setImageError(error.message || 'Failed to upload image');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setImageError(null);

    try {
      // Upload image if selected
      let featuredImageUrl = formData.featuredImage;
      if (fileInputRef.current?.files?.[0]) {
        const uploadedUrl = await handleImageUpload();
        if (uploadedUrl) {
          featuredImageUrl = uploadedUrl;
        }
      }

      // Build the data object
      // Get text from contentBlocks for SEO fallback
      const getBlocksText = () => {
        return formData.contentBlocks.map(block => {
          if (block.type === 'heading' || block.type === 'paragraph') {
            return block.text || '';
          } else if (block.type === 'bulletList') {
            return (block.items || []).join(' ');
          }
          return '';
        }).join(' ');
      };

      const data: any = {
        title: formData.title,
        slug: formData.slug,
        contentBlocks: formData.contentBlocks,
        category: formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        status: formData.status,
        featured: formData.featured,
        featuredImageAlt: formData.featuredImageAlt,
        seo: {
          metaTitle: formData.seo.metaTitle || formData.title,
          metaDescription: formData.seo.metaDescription || getBlocksText().substring(0, 160),
          keywords: formData.seo.keywords.split(',').map(k => k.trim()).filter(Boolean),
        },
      };

      // Handle publish date based on status
      if (formData.status === 'published') {
        data.publishDate = new Date();
        data.scheduledPublishDate = null;
      } else if (formData.status === 'scheduled' && formData.scheduledPublishDate) {
        // Combine date and time into a single Date object
        const dateStr = formData.scheduledPublishDate;
        const timeStr = formData.scheduledPublishTime || '09:00';
        data.scheduledPublishDate = new Date(`${dateStr}T${timeStr}:00`);
        data.publishDate = null;
      } else {
        data.publishDate = null;
        data.scheduledPublishDate = null;
      }

      // Only include featuredImage if we have one
      if (featuredImageUrl) {
        data.featuredImage = featuredImageUrl;
      }

      const response = await blogAPI.create(data);
      if (response.success) {
        router.push('/admin/blog');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to create blog post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/blog" className="text-brand-grey-500 dark:text-brand-grey-400 hover:text-brand-black dark:hover:text-white transition-colors">
            ← Back to Blog
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-brand-black dark:text-white mb-8">Create New Blog Post</h1>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white dark:bg-brand-grey-900 p-6 rounded-lg border border-brand-grey-200 dark:border-brand-grey-800 space-y-6">
          {/* Title & Slug */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-brand-black dark:text-white mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setFormData(prev => ({ 
                    ...prev, 
                    title,
                    slug: prev.slug || generateSlug(title)
                  }));
                }}
                required
                className="w-full px-4 py-3 border border-brand-grey-200 dark:border-brand-grey-700 bg-white dark:bg-brand-grey-800 text-brand-black dark:text-white rounded-lg focus:outline-none focus:border-accent"
                placeholder="Enter blog post title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-black dark:text-white mb-2">
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                required
                pattern="[a-z0-9-]+"
                className="w-full px-4 py-3 border border-brand-grey-200 dark:border-brand-grey-700 bg-white dark:bg-brand-grey-800 text-brand-black dark:text-white rounded-lg focus:outline-none focus:border-accent"
                placeholder="url-friendly-slug"
              />
              <p className="text-xs text-brand-grey-400 dark:text-brand-grey-500 mt-1">
                URL: /blog/{formData.slug || 'your-slug'}
              </p>
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-brand-black dark:text-white mb-2">
              Featured Image
              <span className="text-brand-grey-400 dark:text-brand-grey-500 font-normal ml-1">(optional but recommended)</span>
            </label>
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageSelect}
                className="w-full px-4 py-3 border border-brand-grey-200 dark:border-brand-grey-700 bg-white dark:bg-brand-grey-800 text-brand-black dark:text-white rounded-lg focus:outline-none focus:border-accent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-brand-grey-100 dark:file:bg-brand-grey-700 file:text-sm file:font-medium file:text-brand-black dark:file:text-white hover:file:bg-brand-grey-200 dark:hover:file:bg-brand-grey-600 cursor-pointer"
              />
              <p className="text-xs text-brand-grey-400 dark:text-brand-grey-500">
                Accepted formats: JPG, JPEG, PNG, WebP. Max size: 5MB
              </p>

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative mt-3">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-brand-grey-100 dark:bg-brand-grey-800">
                    <img
                      src={imagePreview}
                      alt="Featured image preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Error Message */}
              {imageError && (
                <p className="text-sm text-red-500 dark:text-red-400">{imageError}</p>
              )}
            </div>
          </div>

          {/* Image Alt Text */}
          <div>
            <label className="block text-sm font-medium text-brand-black dark:text-white mb-2">
              Image Alt Text
              <span className="text-brand-grey-400 dark:text-brand-grey-500 font-normal ml-1">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.featuredImageAlt}
              onChange={(e) => setFormData(prev => ({ ...prev, featuredImageAlt: e.target.value }))}
              maxLength={200}
              className="w-full px-4 py-3 border border-brand-grey-200 dark:border-brand-grey-700 bg-white dark:bg-brand-grey-800 text-brand-black dark:text-white rounded-lg focus:outline-none focus:border-accent"
              placeholder="Describe the image for accessibility and SEO"
            />
            <p className="text-xs text-brand-grey-400 dark:text-brand-grey-500 mt-1">
              {formData.featuredImageAlt.length}/200 characters. Used for screen readers and search engines.
            </p>
          </div>

          {/* Content Blocks */}
          <div>
            <label className="block text-sm font-medium text-brand-black dark:text-white mb-2">
              Content *
            </label>
            <ContentBlocksEditor
              blocks={formData.contentBlocks}
              onChange={(blocks) => setFormData(prev => ({ ...prev, contentBlocks: blocks }))}
            />
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-brand-black dark:text-white mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-brand-grey-200 dark:border-brand-grey-700 bg-white dark:bg-brand-grey-800 text-brand-black dark:text-white rounded-lg focus:outline-none focus:border-accent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-black dark:text-white mb-2">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full px-4 py-3 border border-brand-grey-200 dark:border-brand-grey-700 bg-white dark:bg-brand-grey-800 text-brand-black dark:text-white rounded-lg focus:outline-none focus:border-accent"
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>

          {/* Status & Featured */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-brand-black dark:text-white mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-3 border border-brand-grey-200 dark:border-brand-grey-700 bg-white dark:bg-brand-grey-800 text-brand-black dark:text-white rounded-lg focus:outline-none focus:border-accent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="archived">Archived</option>
                </select>
                <p className="text-xs text-brand-grey-400 dark:text-brand-grey-500 mt-1">
                  {formData.status === 'scheduled'
                    ? 'Post will auto-publish at the scheduled date/time'
                    : formData.status === 'published'
                    ? 'Post is immediately visible to public'
                    : 'Only visible to admins'}
                </p>
              </div>

              <div className="flex items-center pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-5 h-5 rounded border-brand-grey-300 dark:border-brand-grey-600 text-accent focus:ring-accent"
                  />
                  <span className="text-sm font-medium text-brand-black dark:text-white">Mark as Featured Post</span>
                </label>
              </div>
            </div>

            {/* Schedule Post Section - Only shown when status is 'scheduled' */}
            {formData.status === 'scheduled' && (
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-brand-black dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Schedule Publish Date & Time
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-black dark:text-white mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.scheduledPublishDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledPublishDate: e.target.value }))}
                      required={formData.status === 'scheduled'}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-brand-grey-200 dark:border-brand-grey-700 bg-white dark:bg-brand-grey-800 text-brand-black dark:text-white rounded-lg focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-black dark:text-white mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={formData.scheduledPublishTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledPublishTime: e.target.value }))}
                      className="w-full px-4 py-3 border border-brand-grey-200 dark:border-brand-grey-700 bg-white dark:bg-brand-grey-800 text-brand-black dark:text-white rounded-lg focus:outline-none focus:border-accent"
                    />
                    <p className="text-xs text-brand-grey-400 dark:text-brand-grey-500 mt-1">
                      Defaults to 9:00 AM if not set
                    </p>
                  </div>
                </div>
                <p className="text-xs text-brand-grey-500 dark:text-brand-grey-400 mt-3">
                  <strong>Note:</strong> The post will automatically change to "Published" status at the scheduled time.
                  Make sure your cron job is configured to call the publish endpoint regularly.
                </p>
              </div>
            )}
          </div>

          {/* SEO Section */}
          <div className="border-t border-brand-grey-200 dark:border-brand-grey-700 pt-6">
            <h3 className="text-lg font-semibold text-brand-black dark:text-white mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-black dark:text-white mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.seo.metaTitle}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    seo: { ...prev.seo, metaTitle: e.target.value }
                  }))}
                  maxLength={60}
                  className="w-full px-4 py-3 border border-brand-grey-200 dark:border-brand-grey-700 bg-white dark:bg-brand-grey-800 text-brand-black dark:text-white rounded-lg focus:outline-none focus:border-accent"
                  placeholder="SEO title (defaults to post title)"
                />
                <p className="text-xs text-brand-grey-400 dark:text-brand-grey-500 mt-1">
                  {formData.seo.metaTitle.length}/60 characters
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black dark:text-white mb-2">
                  Meta Description
                </label>
                <textarea
                  value={formData.seo.metaDescription}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    seo: { ...prev.seo, metaDescription: e.target.value }
                  }))}
                  rows={2}
                  maxLength={160}
                  className="w-full px-4 py-3 border border-brand-grey-200 dark:border-brand-grey-700 bg-white dark:bg-brand-grey-800 text-brand-black dark:text-white rounded-lg focus:outline-none focus:border-accent"
                  placeholder="SEO description (defaults to first 160 chars of content)"
                />
                <p className="text-xs text-brand-grey-400 dark:text-brand-grey-500 mt-1">
                  {formData.seo.metaDescription.length}/160 characters
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black dark:text-white mb-2">
                  Keywords
                </label>
                <input
                  type="text"
                  value={formData.seo.keywords}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    seo: { ...prev.seo, keywords: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-brand-grey-200 dark:border-brand-grey-700 bg-white dark:bg-brand-grey-800 text-brand-black dark:text-white rounded-lg focus:outline-none focus:border-accent"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-brand-grey-200 dark:border-brand-grey-700">
            <Link
              href="/admin/blog"
              className="px-6 py-3 border border-brand-grey-200 dark:border-brand-grey-700 text-brand-black dark:text-white rounded-lg hover:bg-brand-grey-50 dark:hover:bg-brand-grey-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="px-6 py-3 bg-accent text-brand-black font-semibold rounded-lg hover:bg-accent-light transition-colors disabled:opacity-50"
            >
              {uploadingImage ? 'Uploading Image...' : saving ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </div>
      </form>
      </div>
    </AdminLayout>
  );
}