const express = require('express');
const router = express.Router();
const { publishScheduledPosts, getScheduledPosts, getSchedulerStatus } = require('../controllers/cronController');
const { protect } = require('../middleware/auth');

// GET /api/cron/status - Get scheduler status (admin only)
router.get('/status', protect, getSchedulerStatus);

// GET /api/cron/scheduled - Get upcoming scheduled posts (admin only)
router.get('/scheduled', protect, getScheduledPosts);

// POST /api/cron/publish-scheduled - Publish due scheduled posts
// Can be called with X-Cron-Secret header or ?secret= query param
// Also runs automatically every minute via internal scheduler
router.post('/publish-scheduled', publishScheduledPosts);

module.exports = router;