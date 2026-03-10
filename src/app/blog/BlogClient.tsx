"use client";

import Container from "@/components/Container";
import Link from "next/link";
import { motion } from "framer-motion";
import { getImageUrl } from "@/lib/utils";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  contentBlocks?: {
    id: string;
    type: 'heading' | 'paragraph' | 'bulletList';
    level?: 1 | 2 | 3;
    text?: string;
    items?: string[];
  }[];
  category: string;
  author?: { name: string };
  featuredImage?: string;
  featuredImageAlt?: string;
  featured?: boolean;
  status: string;
  publishDate?: string;
  createdAt: string;
  readTime?: number;
}

interface BlogClientProps {
  featuredPosts: BlogPost[];
  recentPosts: BlogPost[];
  publishedBlogs: BlogPost[];
}

// Helper to get excerpt from contentBlocks or content
function getExcerpt(post: BlogPost, maxLength: number = 150): string {
  // First try to get text from contentBlocks
  if (post.contentBlocks && post.contentBlocks.length > 0) {
    const text = post.contentBlocks
      .map(block => {
        if (block.type === 'heading' || block.type === 'paragraph') {
          return block.text || '';
        } else if (block.type === 'bulletList') {
          return (block.items || []).join(' ');
        }
        return '';
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  // Fallback to old content field
  if (!post.content) return '';
  // Strip HTML tags
  const plainText = post.content.replace(/<[^>]*>/g, '').replace(/\n/g, ' ');
  // Truncate to max length
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength).trim() + '...';
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function BlogClient({ featuredPosts, recentPosts, publishedBlogs }: BlogClientProps) {
  return (
    <>
      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="relative py-20 md:py-28 bg-white dark:bg-brand-grey-950 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-hero-gradient" />
          <motion.div 
            className="absolute -top-40 -right-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          
          <Container className="relative z-10">
            <motion.span 
              className="text-label text-accent uppercase mb-6 block"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              Featured
            </motion.span>
            <motion.div 
              className="grid lg:grid-cols-2 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {featuredPosts.slice(0, 2).map((post) => (
                <motion.div
                  key={post._id}
                  variants={itemVariants}
                  whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block bg-white dark:bg-brand-grey-900 border border-brand-grey-200 dark:border-brand-grey-800 hover:border-accent transition-all duration-300 overflow-hidden group"
                  >
                    {post.featuredImage && (
                      <div className="overflow-hidden">
                        <motion.img
                          src={getImageUrl(post.featuredImage)}
                          alt={post.featuredImageAlt || post.title}
                          className="w-full h-48 object-cover"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                    <div className="p-8">
                      <span className="text-label text-brand-grey-400 dark:text-brand-grey-500 uppercase mb-3 block">
                        {post.category}
                      </span>
                      <h3 className="text-heading-3 text-brand-black dark:text-white mb-3 group-hover:text-accent transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-body text-brand-grey-500 dark:text-brand-grey-400 mb-4 line-clamp-3">
                        {getExcerpt(post, 200)}
                      </p>
                      <div className="flex items-center gap-4 text-body-sm text-brand-grey-400 dark:text-brand-grey-500">
                        <span>{post.author?.name || "Growth Valley"}</span>
                        <span>•</span>
                        <span>{post.readTime || 5} min read</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </Container>
        </section>
      )}

      {/* All Posts */}
      <section className="relative py-20 md:py-28 bg-brand-grey-50 dark:bg-brand-grey-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern" />
        <motion.div 
          className="absolute top-1/4 left-0 w-56 h-56 bg-accent/8 rounded-full blur-3xl"
          animate={{ x: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <Container className="relative z-10">
          <motion.span 
            className="text-label text-brand-grey-400 dark:text-brand-grey-500 uppercase mb-6 block"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            All Articles
          </motion.span>
          
          {publishedBlogs.length === 0 ? (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <p className="text-body-lg text-brand-grey-500 dark:text-brand-grey-400">
                No blog posts yet. Check back soon!
              </p>
            </motion.div>
          ) : (
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {(featuredPosts.length > 0 ? recentPosts : publishedBlogs).map((post) => (
                <motion.div
                  key={post._id}
                  variants={itemVariants}
                  whileHover={{ y: -5, boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }}
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block bg-white dark:bg-brand-grey-900 border border-brand-grey-200 dark:border-brand-grey-800 overflow-hidden hover:border-accent transition-all duration-300 group"
                  >
                    {post.featuredImage && (
                      <div className="overflow-hidden">
                        <motion.img
                          src={getImageUrl(post.featuredImage)}
                          alt={post.featuredImageAlt || post.title}
                          className="w-full h-48 object-cover"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <span className="text-label text-brand-grey-400 dark:text-brand-grey-500 uppercase mb-2 block">
                        {post.category}
                      </span>
                      <h3 className="text-heading-4 text-brand-black dark:text-white mb-2 group-hover:text-accent transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-body-sm text-brand-grey-500 dark:text-brand-grey-400 mb-4 line-clamp-3">
                        {getExcerpt(post, 150)}
                      </p>
                      <div className="flex items-center justify-between text-body-sm text-brand-grey-400 dark:text-brand-grey-500">
                        <span>{new Date(post.publishDate || post.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}</span>
                        <span>{post.readTime || 5} min read</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </Container>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-28 bg-white dark:bg-brand-grey-950 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-animated-gradient" />
        
        {/* Floating Shapes */}
        <motion.div 
          className="absolute top-10 left-1/4 w-4 h-4 bg-accent/30 rounded-full"
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 right-1/3 w-3 h-3 bg-accent/25 rotate-45"
          animate={{ rotate: [45, 90, 45] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <Container className="relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-heading-2 text-brand-black dark:text-white mb-6">
              Want personalized insights for your business?
            </h2>
            <p className="text-body-lg text-brand-grey-500 dark:text-brand-grey-400 mb-10">
              Our discovery process uncovers specific opportunities in your revenue operations.
            </p>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/contact"
                className="inline-flex items-center justify-center font-semibold uppercase tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-brand-grey-950 disabled:opacity-50 disabled:cursor-not-allowed bg-accent text-brand-black hover:bg-accent-light focus:ring-accent px-6 py-3 text-sm"
              >
                Schedule a Discovery Call
              </Link>
            </motion.div>
          </motion.div>
        </Container>
      </section>
    </>
  );
}