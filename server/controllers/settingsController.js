const { Settings } = require('../models');

// @desc    Get site settings
// @route   GET /api/settings
// @access  Public
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSingleton();

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch settings',
    });
  }
};

// @desc    Update site settings
// @route   PUT /api/admin/settings
// @access  Private (Admin)
exports.updateSettings = async (req, res) => {
  try {
    const settings = await Settings.getSingleton();

    // Update allowed fields
    const allowedUpdates = [
      'siteName', 'siteTagline', 'siteDescription',
      'socialLinks', 'hero', 'footer',
      'businessInfo', 'seo', 'tracking', 'customCss', 'customJs',
      'maintenanceMode', 'favicon',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        // For nested objects, merge with existing data
        if (typeof req.body[field] === 'object' && !Array.isArray(req.body[field])) {
          settings[field] = {
            ...settings[field]?.toObject?.() || {},
            ...req.body[field]
          };
        } else {
          settings[field] = req.body[field];
        }
      }
    });

    await settings.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update settings',
    });
  }
};

// @desc    Reset settings to default
// @route   POST /api/admin/settings/reset
// @access  Private (Admin)
exports.resetSettings = async (req, res) => {
  try {
    await Settings.deleteMany({});
    const settings = await Settings.create({});

    res.json({
      success: true,
      message: 'Settings reset to default',
      data: settings,
    });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset settings',
    });
  }
};
