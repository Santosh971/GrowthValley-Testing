const { Enquiry, Settings, Content } = require('../models');
const csv = require('csv-stringify/sync');
const { sendEnquiryNotification, sendEnquiryConfirmation } = require('../services/email');
const config = require('../config');

// @desc    Create new enquiry (public endpoint)
// @route   POST /api/contact
// @access  Public
exports.createEnquiry = async (req, res) => {
  try {
    const { name, email, phone, company, service, message, source, interest } = req.body;

    const enquiry = await Enquiry.create({
      name,
      email,
      phone,
      company,
      service: service || interest || 'Other',
      message,
      source: source || 'website',
    });

    // Send notification email to admin and confirmation to user
    try {
      // Get admin email from Contact page content or fall back to config
      // First try Contact page content, then Settings as fallback
      let adminEmail = null;

      try {
        const contactContent = await Content.findOne({ page: 'contact' });
        if (contactContent?.sections?.contactInfo?.email) {
          adminEmail = contactContent.sections.contactInfo.email;
        }
      } catch (e) {
        // Contact content not found, try Settings
      }

      // Fallback to Settings contactInfo.email (for backwards compatibility)
      if (!adminEmail) {
        const settings = await Settings.getSingleton();
        adminEmail = settings?.contactInfo?.email || config.adminEmail;
      }

      // Send notification to admin (don't wait for it)
      if (adminEmail) {
        sendEnquiryNotification(enquiry, adminEmail).catch(err => {
          console.error('Failed to send admin notification email:', err.message);
        });
      }

      // Send confirmation to user (don't wait for it)
      if (email) {
        sendEnquiryConfirmation(enquiry).catch(err => {
          console.error('Failed to send user confirmation email:', err.message);
        });
      }
    } catch (emailError) {
      // Log email error but don't fail the request
      console.error('Email notification error:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your enquiry. We will get back to you soon.',
      data: { id: enquiry._id },
    });
  } catch (error) {
    console.error('Create enquiry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit enquiry',
    });
  }
};

// @desc    Get all enquiries
// @route   GET /api/admin/enquiries
// @access  Private (Admin)
exports.getEnquiries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate,
      endDate,
    } = req.query;

    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Search by name, email, or company
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const enquiries = await Enquiry.find(query)
      .populate('assignedTo', 'name email')
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Enquiry.countDocuments(query);

    res.json({
      success: true,
      data: enquiries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get enquiries error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch enquiries',
    });
  }
};

// @desc    Get enquiry by ID
// @route   GET /api/admin/enquiries/:id
// @access  Private (Admin)
exports.getEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('notes.createdBy', 'name email');

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        error: 'Enquiry not found',
      });
    }

    res.json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    console.error('Get enquiry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch enquiry',
    });
  }
};

// @desc    Update enquiry status
// @route   PUT /api/admin/enquiries/:id/status
// @access  Private (Admin)
exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.body;

    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status, priority, assignedTo },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        error: 'Enquiry not found',
      });
    }

    res.json({
      success: true,
      message: 'Enquiry updated successfully',
      data: enquiry,
    });
  } catch (error) {
    console.error('Update enquiry status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update enquiry',
    });
  }
};

// @desc    Add note to enquiry
// @route   POST /api/admin/enquiries/:id/notes
// @access  Private (Admin)
exports.addNote = async (req, res) => {
  try {
    const { content } = req.body;

    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          notes: {
            content,
            createdBy: req.admin.id,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    ).populate('notes.createdBy', 'name email');

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        error: 'Enquiry not found',
      });
    }

    res.json({
      success: true,
      message: 'Note added successfully',
      data: enquiry.notes[enquiry.notes.length - 1],
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add note',
    });
  }
};

// @desc    Delete enquiry
// @route   DELETE /api/admin/enquiries/:id
// @access  Private (Admin)
exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        error: 'Enquiry not found',
      });
    }

    res.json({
      success: true,
      message: 'Enquiry deleted successfully',
    });
  } catch (error) {
    console.error('Delete enquiry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete enquiry',
    });
  }
};

// @desc    Export enquiries to CSV
// @route   GET /api/admin/enquiries/export
// @access  Private (Admin)
exports.exportEnquiries = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    const query = {};
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const enquiries = await Enquiry.find(query)
      .select('name email phone company service message status priority source createdAt')
      .sort({ createdAt: -1 });

    // Convert to CSV
    const records = enquiries.map((e) => ({
      Name: e.name,
      Email: e.email,
      Phone: e.phone,
      Company: e.company,
      Service: e.service,
      Message: e.message.substring(0, 200),
      Status: e.status,
      Priority: e.priority,
      Source: e.source,
      'Created At': e.createdAt.toISOString(),
    }));

    const csvString = csv.stringify(records, {
      header: true,
      columns: ['Name', 'Email', 'Phone', 'Company', 'Service', 'Message', 'Status', 'Priority', 'Source', 'Created At'],
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="enquiries-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvString);
  } catch (error) {
    console.error('Export enquiries error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export enquiries',
    });
  }
};

// @desc    Get enquiry stats
// @route   GET /api/admin/enquiries/stats
// @access  Private (Admin)
exports.getEnquiryStats = async (req, res) => {
  try {
    const statusCounts = await Enquiry.getStatusCounts();
    const recentEnquiries = await Enquiry.findRecent(7);
    const totalEnquiries = await Enquiry.countDocuments();
    const newEnquiries = await Enquiry.countDocuments({ status: 'new' });

    res.json({
      success: true,
      data: {
        total: totalEnquiries,
        new: newEnquiries,
        byStatus: statusCounts,
        recentCount: recentEnquiries.length,
      },
    });
  } catch (error) {
    console.error('Get enquiry stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch enquiry stats',
    });
  }
};