const cron = require('node-cron');
const { Blog } = require('../models');

/**
 * Scheduler Service for handling scheduled tasks
 */
class SchedulerService {
  constructor() {
    this.jobs = [];
  }

  /**
   * Start all scheduled jobs
   */
  start() {
    console.log('[Scheduler] Starting scheduled tasks...');

    // Job 1: Check and publish scheduled blog posts - runs every minute
    const scheduledPostsJob = cron.schedule('* * * * *', async () => {
      await this.publishScheduledPosts();
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.jobs.push(scheduledPostsJob);
    console.log('[Scheduler] Scheduled posts job started (runs every minute)');

    // Run once on startup to catch any missed posts
    this.publishScheduledPosts().catch(err => {
      console.error('[Scheduler] Error on startup check:', err.message);
    });
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    console.log('[Scheduler] Stopping scheduled tasks...');
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
  }

  /**
   * Check and publish scheduled posts that are due
   */
  async publishScheduledPosts() {
    try {
      const now = new Date();

      // Find all scheduled posts that are due for publishing
      const duePosts = await Blog.find({
        status: 'scheduled',
        scheduledPublishDate: { $lte: now }
      }).lean();

      if (duePosts.length === 0) {
        return; // No posts to publish
      }

      console.log(`[Scheduler] Found ${duePosts.length} scheduled post(s) to publish`);

      // Update each post to published status
      for (const post of duePosts) {
        await Blog.findByIdAndUpdate(post._id, {
          status: 'published',
          publishDate: post.scheduledPublishDate || now,
          scheduledPublishDate: null
        });

        console.log(`[Scheduler] Published: "${post.title}" (ID: ${post._id})`);
      }

      console.log(`[Scheduler] Successfully published ${duePosts.length} post(s)`);
    } catch (error) {
      console.error('[Scheduler] Error publishing scheduled posts:', error.message);
    }
  }

  /**
   * Get next scheduled post
   */
  async getNextScheduledPost() {
    try {
      return await Blog.findOne({ status: 'scheduled' })
        .sort({ scheduledPublishDate: 1 })
        .lean();
    } catch (error) {
      console.error('[Scheduler] Error getting next scheduled post:', error.message);
      return null;
    }
  }

  /**
   * Get all upcoming scheduled posts
   */
  async getUpcomingScheduledPosts() {
    try {
      return await Blog.find({ status: 'scheduled' })
        .sort({ scheduledPublishDate: 1 })
        .populate('author', 'name email')
        .lean();
    } catch (error) {
      console.error('[Scheduler] Error getting scheduled posts:', error.message);
      return [];
    }
  }
}

// Export singleton instance
module.exports = new SchedulerService();