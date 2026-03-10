const { Blog } = require('../models');
const { parsePagination, buildSearchFilter, generateSlug, generateUniqueSlug } = require('../services/utils');

/**
 * @desc    Get all blog posts (public)
 * @route   GET /api/blog
 * @access  Public
 */
const getBlogs = async (req, res) => {
  try {
    const { page, limit, skip, sortBy, sortOrder, search } = parsePagination(req.query, {
      sortBy: 'publishDate',
      limit: 10
    });
    
    // Build filter
    const filter = { status: 'published', publishDate: { $lte: new Date() } };
    
    if (search) {
      Object.assign(filter, buildSearchFilter(search, ['title', 'content', 'category']));
    }
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.tag) {
      filter.tags = req.query.tag.toLowerCase();
    }
    
    // Get posts
    const [posts, total] = await Promise.all([
      Blog.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email avatar')
        .lean(),
      Blog.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog posts'
    });
  }
};

/**
 * @desc    Get single blog post by slug (public)
 * @route   GET /api/blog/:slug
 * @access  Public
 */
const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const post = await Blog.findOne({ slug, status: 'published' })
      .populate('author', 'name email avatar');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }
    
    // Increment view count
    await Blog.findByIdAndUpdate(post._id, { $inc: { viewCount: 1 } });
    
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog post'
    });
  }
};

/**
 * @desc    Get all blog posts (admin)
 * @route   GET /api/admin/blog
 * @access  Private
 */
const getAdminBlogs = async (req, res) => {
  try {
    const { page, limit, skip, sortBy, sortOrder, search } = parsePagination(req.query, {
      sortBy: 'createdAt'
    });
    
    // Build filter
    const filter = {};
    
    if (search) {
      Object.assign(filter, buildSearchFilter(search, ['title', 'slug', 'content', 'category']));
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Get posts
    const [posts, total] = await Promise.all([
      Blog.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email avatar')
        .lean(),
      Blog.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get admin blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog posts'
    });
  }
};

/**
 * @desc    Get single blog post by ID (admin)
 * @route   GET /api/admin/blog/:id
 * @access  Private
 */
const getAdminBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Blog.findById(id)
      .populate('author', 'name email avatar');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }
    
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Get admin blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog post'
    });
  }
};

/**
 * @desc    Create blog post
 * @route   POST /api/admin/blog
 * @access  Private
 */
const createBlog = async (req, res) => {
  try {
    const { title, slug, ...rest } = req.body;
    
    // Generate or validate slug
    let finalSlug = slug;
    if (!finalSlug) {
      finalSlug = await generateUniqueSlug(
        generateSlug(title),
        async (s) => !!(await Blog.exists({ slug: s }))
      );
    } else {
      // Check if slug exists
      const existing = await Blog.exists({ slug: finalSlug });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'A post with this slug already exists'
        });
      }
    }
    
    const post = await Blog.create({
      title,
      slug: finalSlug,
      ...rest,
      author: req.admin._id
    });
    
    await post.populate('author', 'name email avatar');
    
    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: post
    });
  } catch (error) {
    console.error('Create blog error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A post with this slug already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create blog post'
    });
  }
};

/**
 * @desc    Update blog post
 * @route   PUT /api/admin/blog/:id
 * @access  Private
 */
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { slug, ...updates } = req.body;
    
    const post = await Blog.findById(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }
    
    // Check slug uniqueness if changing
    if (slug && slug !== post.slug) {
      const existing = await Blog.exists({ slug, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'A post with this slug already exists'
        });
      }
      post.slug = slug;
    }
    
    // Update fields
    Object.keys(updates).forEach(key => {
      post[key] = updates[key];
    });
    
    await post.save();
    await post.populate('author', 'name email avatar');
    
    res.json({
      success: true,
      message: 'Blog post updated successfully',
      data: post
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blog post'
    });
  }
};

/**
 * @desc    Delete blog post
 * @route   DELETE /api/admin/blog/:id
 * @access  Private (admin only)
 */
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Blog.findByIdAndDelete(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog post'
    });
  }
};

/**
 * @desc    Get blog categories
 * @route   GET /api/blog/categories
 * @access  Public
 */
const getCategories = async (req, res) => {
  try {
    const categories = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      data: categories.map(c => ({ name: c._id, count: c.count }))
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

/**
 * @desc    Get blog tags
 * @route   GET /api/blog/tags
 * @access  Public
 */
const getTags = async (req, res) => {
  try {
    const tags = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);
    
    res.json({
      success: true,
      data: tags.map(t => ({ name: t._id, count: t.count }))
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tags'
    });
  }
};

module.exports = {
  getBlogs,
  getBlogBySlug,
  getAdminBlogs,
  getAdminBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getCategories,
  getTags
};