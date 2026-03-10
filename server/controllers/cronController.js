const { Blog } = require('../models');
const scheduler = require('../services/scheduler');

/**
 * @desc    Publish scheduled blog posts that are due
 * @route   POST /api/cron/publish-scheduled
 * @access  Public (requires CRON_SECRET for external calls)
 */
const publishScheduledPosts = async (req, res) => {
  try {
    // Verify cron secret for external calls
    const cronSecret = req.headers['x-cron-secret'] || req.query.secret;
    const expectedSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is set, require it for external calls
    // But allow internal scheduler to work without it
    if (expectedSecret && cronSecret && cronSecret !== expectedSecret) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid cron secret'
      });
    }

    const now = new Date();

    // Find all scheduled posts that are due for publishing
    const scheduledPosts = await Blog.find({
      status: 'scheduled',
      scheduledPublishDate: { $lte: now }
    });

    if (scheduledPosts.length === 0) {
      return res.json({
        success: true,
        message: 'No scheduled posts due for publishing',
        publishedCount: 0,
        publishedPosts: []
      });
    }

    // Update each post to published status
    const updatePromises = scheduledPosts.map(post => {
      return Blog.findByIdAndUpdate(
        post._id,
        {
          status: 'published',
          publishDate: post.scheduledPublishDate || now,
          scheduledPublishDate: null
        },
        { new: true }
      );
    });

    const updatedPosts = await Promise.all(updatePromises);

    res.json({
      success: true,
      message: `Successfully published ${updatedPosts.length} scheduled post(s)`,
      publishedCount: updatedPosts.length,
      publishedPosts: updatedPosts.map(p => ({
        id: p._id,
        title: p.title,
        slug: p.slug,
        publishDate: p.publishDate
      }))
    });
  } catch (error) {
    console.error('Publish scheduled posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish scheduled posts',
      error: error.message
    });
  }
};

/**
 * @desc    Get upcoming scheduled posts (for admin dashboard)
 * @route   GET /api/cron/scheduled
 * @access  Private (Admin)
 */
const getScheduledPosts = async (req, res) => {
  try {
    const scheduledPosts = await scheduler.getUpcomingScheduledPosts();

    res.json({
      success: true,
      data: scheduledPosts
    });
  } catch (error) {
    console.error('Get scheduled posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheduled posts'
    });
  }
};

/**
 * @desc    Get scheduler status
 * @route   GET /api/cron/status
 * @access  Private (Admin)
 */
const getSchedulerStatus = async (req, res) => {
  try {
    const nextPost = await scheduler.getNextScheduledPost();
    const upcomingPosts = await scheduler.getUpcomingScheduledPosts();

    res.json({
      success: true,
      data: {
        isRunning: true, // Scheduler runs automatically
        nextScheduledPost: nextPost ? {
          id: nextPost._id,
          title: nextPost.title,
          scheduledPublishDate: nextPost.scheduledPublishDate
        } : null,
        totalScheduled: upcomingPosts.length,
        checkInterval: 'Every 1 minute'
      }
    });
  } catch (error) {
    console.error('Get scheduler status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scheduler status'
    });
  }
};

module.exports = {
  publishScheduledPosts,
  getScheduledPosts,
  getSchedulerStatus
};