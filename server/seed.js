/**
 * Seed script for Growth Valley CMS
 * Run with: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Blog, CaseStudy, Settings, PageSEO, Admin } = require('./models');
const TeamMember = require('./models/TeamMember');

// Sample blog posts
const blogPosts = [
  {
    title: 'The Future of B2B Lead Generation: AI-Powered Strategies for 2024',
    slug: 'future-b2b-lead-generation-ai-2024',
    content: `
# The Future of B2B Lead Generation: AI-Powered Strategies for 2024

The landscape of B2B lead generation is undergoing a dramatic transformation. As we move into 2024, artificial intelligence is no longer a futuristic concept—it's a present-day reality that's reshaping how businesses attract, engage, and convert prospects.

## The AI Revolution in Lead Generation

Artificial intelligence has matured to the point where it can analyze vast amounts of data, identify patterns, and make predictions with remarkable accuracy. This capability is transforming every aspect of lead generation:

### 1. Predictive Lead Scoring

Traditional lead scoring relied on manual rules and gut feelings. AI-powered predictive lead scoring uses machine learning algorithms to analyze historical data and identify which leads are most likely to convert.

### 2. Intelligent Outreach Automation

AI can now personalize outreach at scale, analyzing prospect behavior to determine the optimal time, channel, and message for engagement.

### 3. Intent Data Analysis

By analyzing intent signals across the web, AI helps identify companies actively researching solutions in your space—before they've even visited your website.

## Implementation Strategies

To leverage AI for lead generation effectively:

1. **Start with clean data**: AI is only as good as the data it's trained on
2. **Define clear objectives**: Know what success looks like before implementation
3. **Choose the right tools**: Evaluate platforms based on your specific needs
4. **Train your team**: Ensure your sales and marketing teams understand the technology

## Looking Ahead

The future of B2B lead generation is intelligent, automated, and infinitely more effective. Companies that embrace AI-powered strategies today will have a significant competitive advantage tomorrow.
    `,
    category: 'Strategy',
    tags: ['AI', 'Lead Generation', 'B2B', 'Marketing Automation'],
    status: 'published',
    publishDate: new Date(),
    featured: true,
    author: null,
    seo: {
      metaTitle: 'AI-Powered B2B Lead Generation Strategies for 2024',
      metaDescription: 'Learn how AI is transforming B2B lead generation with predictive scoring, intelligent automation, and intent data analysis.',
      keywords: ['AI lead generation', 'B2B marketing', 'predictive lead scoring', 'marketing automation']
    }
  },
  {
    title: 'Marketing Automation Mastery: From Setup to Scale',
    slug: 'marketing-automation-mastery-setup-scale',
    content: `
# Marketing Automation Mastery: From Setup to Scale

Marketing automation has become essential for businesses looking to scale their marketing efforts without exponentially increasing headcount. But implemented incorrectly, it can do more harm than good.

## The Foundation: Getting Setup Right

### Choosing Your Platform

Not all marketing automation platforms are created equal. Consider:

- **Integration capabilities**: How well does it integrate with your existing tech stack?
- **Scalability**: Can it grow with your business?
- **Ease of use**: Will your team actually use it?
- **Support and community**: Is there help when you need it?

### Data Architecture

Before automating, ensure your data foundation is solid:

1. Clean and dedupe your contact database
2. Establish clear data governance policies
3. Define your lead lifecycle stages
4. Create a single source of truth for customer data

## Building Effective Workflows

### Lead Nurturing Sequences

The most effective nurturing sequences are:

- **Relevant**: Based on prospect behavior and interests
- **Timely**: Delivered when most likely to drive action
- **Progressive**: Building toward a conversion event
- **Measurable**: With clear KPIs and optimization opportunities

### Trigger-Based Campaigns

Move beyond time-based campaigns to behavior-triggered automation:

- Website visit triggers
- Content download follow-ups
- Engagement scoring milestones
- Re-engagement campaigns for dormant leads

## Scaling Successfully

As you mature your automation:

1. Start with high-impact, low-complexity workflows
2. Measure, optimize, then scale
3. Build cross-functional processes
4. Invest in ongoing education

Marketing automation done right isn't about doing less—it's about doing more with intention and precision.
    `,
    category: 'Automation',
    tags: ['Marketing Automation', 'Lead Nurturing', 'Workflows', 'CRM'],
    status: 'published',
    publishDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    featured: false,
    author: null,
    seo: {
      metaTitle: 'Marketing Automation Guide: Setup to Scale | Growth Valley',
      metaDescription: 'Master marketing automation with our comprehensive guide covering platform selection, workflow design, and scaling strategies.',
      keywords: ['marketing automation', 'lead nurturing', 'email automation', 'CRM integration']
    }
  },
  {
    title: 'CRM Implementation: Avoiding the 70% Failure Rate',
    slug: 'crm-implementation-avoiding-failure',
    content: `
# CRM Implementation: Avoiding the 70% Failure Rate

It's a staggering statistic: approximately 70% of CRM implementations fail to meet their objectives. The reasons are rarely about the technology itself—it's almost always about people, processes, and planning.

## Why CRM Implementations Fail

### 1. Lack of Clear Objectives

Many organizations implement a CRM because they feel they should, not because they have specific, measurable goals.

**Solution**: Define success before you start. What specific business outcomes are you trying to achieve?

### 2. Poor User Adoption

The best CRM system is worthless if your team doesn't use it.

**Solution**: Involve end-users in the selection and configuration process. Make the system work for them, not the other way around.

### 3. Inadequate Data Migration

Garbage in, garbage out. Migrating bad data just creates bad data in a new system.

**Solution**: Treat data migration as a data quality initiative, not just a technical exercise.

### 4. No Change Management Plan

New systems require new behaviors. Without proper change management, old habits persist.

**Solution**: Develop a comprehensive change management plan including communication, training, and support.

## The Path to Success

### Phase 1: Foundation (Weeks 1-4)
- Define objectives and success metrics
- Document current processes
- Identify integration requirements
- Select the right team

### Phase 2: Configuration (Weeks 5-8)
- Configure system to match workflows
- Clean and migrate data
- Build integrations
- Develop reports and dashboards

### Phase 3: Rollout (Weeks 9-12)
- Train users thoroughly
- Deploy in phases if needed
- Provide ample support
- Monitor and adjust

### Phase 4: Optimization (Ongoing)
- Gather user feedback
- Continuously improve
- Expand functionality
- Measure against objectives

CRM success isn't about the software—it's about the strategy, execution, and commitment to improvement.
    `,
    category: 'Technology',
    tags: ['CRM', 'Implementation', 'Sales Operations', 'Digital Transformation'],
    status: 'published',
    publishDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    featured: true,
    author: null,
    seo: {
      metaTitle: 'CRM Implementation Guide: How to Avoid the 70% Failure Rate',
      metaDescription: 'Learn why most CRM implementations fail and discover the proven strategies to make yours succeed.',
      keywords: ['CRM implementation', 'CRM failure', 'salesforce implementation', 'CRM best practices']
    }
  }
];

// Sample case studies
const caseStudies = [
  {
    title: 'TechCorp Solutions: 3x Pipeline Growth in 90 Days',
    slug: 'techcorp-solutions-pipeline-growth',
    industry: 'SaaS',
    clientName: 'TechCorp Solutions',
    clientLogo: '/images/clients/techcorp.svg',
    featuredImage: '/images/case-studies/techcorp-hero.jpg',
    challenge: 'TechCorp, a B2B SaaS company, was struggling with inconsistent lead flow and a lengthy sales cycle averaging 120 days. Their marketing team was generating leads, but sales was frustrated with the quality, leading to misalignment and missed revenue targets.',
    solution: 'We implemented a comprehensive growth system including:\n\n**1. Predictive Lead Scoring**\nUsing AI to analyze historical win/loss data and identify the characteristics of ideal customers.\n\n**2. Multi-touch Nurture Sequences**\nDeveloped personalized nurture sequences based on industry, company size, and behavioral signals.\n\n**3. Sales-Marketing Alignment**\nCreated shared definitions, SLAs, and weekly sync processes to ensure both teams were working toward common goals.',
    results: [
      { metric: 'Pipeline Value', value: '3x increase', description: 'From $2M to $6M in active pipeline' },
      { metric: 'Sales Cycle', value: '45 days shorter', description: 'Reduced from 120 to 75 days' },
      { metric: 'Lead Quality', value: '85% increase', description: 'In SQL to Opportunity conversion' },
      { metric: 'Revenue', value: '2.5x YoY growth', description: 'From $4M to $10M ARR' }
    ],
    timeline: '90 days for initial implementation, ongoing optimization',
    technologies: ['HubSpot', 'Salesforce', 'Clearbit', 'Drift'],
    testimonial: {
      quote: 'Growth Valley transformed our approach to revenue generation. Within 90 days, we had more qualified pipeline than we knew what to do with—and the systems to handle it.',
      author: 'Sarah Chen',
      designation: 'VP of Marketing',
      avatar: '/images/testimonials/sarah-chen.jpg'
    },
    featured: true,
    status: 'published',
    publishDate: new Date()
  },
  {
    title: 'FinanceFirst: From $5M to $15M ARR',
    slug: 'financefirst-growth-story',
    industry: 'Finance',
    clientName: 'FinanceFirst',
    clientLogo: '/images/clients/financefirst.svg',
    featuredImage: '/images/case-studies/financefirst-hero.jpg',
    challenge: 'FinanceFirst, a fintech startup providing B2B payment solutions, had reached $5M ARR but was struggling to scale beyond. Their acquisition costs were rising, and CAC:LTV ratios were deteriorating.',
    solution: 'We developed and executed a full-funnel growth strategy:\n\n**1. Ideal Customer Profile Refinement**\nAnalyzed existing customer data to identify the most profitable segments and realigned targeting.\n\n**2. Account-Based Marketing Implementation**\nBuilt a targeted ABM program for high-value accounts with personalized campaigns.\n\n**3. Customer Success Integration**\nImplemented expansion revenue playbooks and reducing churn by identifying at-risk accounts early.',
    results: [
      { metric: 'ARR', value: '$15M', description: 'Tripled annual recurring revenue' },
      { metric: 'CAC:LTV', value: '1:5', description: 'Improved from 1:2.5' },
      { metric: 'Expansion Revenue', value: '40%', description: 'Of total revenue from existing customers' },
      { metric: 'Churn', value: '<3%', description: 'Reduced from 8% annually' }
    ],
    timeline: '12 months',
    technologies: ['Marketo', 'Salesforce', '6sense', 'Gong'],
    testimonial: {
      quote: 'Working with Growth Valley was transformative. They didn\'t just give us advice—they rolled up their sleeves and helped us build a revenue engine that continues to accelerate.',
      author: 'Michael Rodriguez',
      designation: 'CEO',
      avatar: '/images/testimonials/michael-rodriguez.jpg'
    },
    featured: true,
    status: 'published',
    publishDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  }
];

// Team members
const teamMembers = [
  {
    name: 'Umesh Khivasara',
    role: 'Founder & CEO',
    bio: 'With over a decade of experience in B2B growth, Umesh founded Growth Valley to help companies transform their revenue operations. He specializes in go-to-market strategy and revenue architecture.',
    image: '',
    linkedin: 'https://linkedin.com/in/umeshkhivasara',
    twitter: '',
    email: 'umesh@growthvalley.in',
    order: 1,
    status: 'active'
  },
  {
    name: 'Priya Sharma',
    role: 'Head of Revenue Operations',
    bio: 'Priya leads our RevOps practice, bringing deep expertise in CRM implementation, marketing automation, and sales enablement for enterprise clients.',
    image: '',
    linkedin: '',
    twitter: '',
    email: '',
    order: 2,
    status: 'active'
  },
  {
    name: 'Rahul Mehta',
    role: 'Senior Consultant',
    bio: 'Rahul specializes in marketing automation and demand generation. He has helped dozens of SaaS companies build scalable lead generation engines.',
    image: '',
    linkedin: '',
    twitter: '',
    email: '',
    order: 3,
    status: 'active'
  },
  {
    name: 'Anita Patel',
    role: 'Client Success Manager',
    bio: 'Anita ensures our clients achieve their growth objectives. She manages client relationships and oversees implementation projects from start to finish.',
    image: '',
    linkedin: '',
    twitter: '',
    email: '',
    order: 4,
    status: 'active'
  }
];

// Site settings
const defaultSettings = {
  siteName: 'Growth Valley',
  siteTagline: 'B2B Growth Partners',
  siteDescription: 'We help B2B companies build predictable revenue engines through strategic consulting, marketing automation, and CRM implementation.',
  socialLinks: {
    linkedin: 'https://linkedin.com/company/growthvalley',
    twitter: 'https://twitter.com/growthvalley'
  },
  hero: {
    title: 'Grow Your B2B Revenue',
    subtitle: 'We help technology companies build predictable, scalable revenue engines',
    ctaText: 'Start Growing',
    ctaLink: '/contact'
  },
  businessInfo: {
    legalName: 'Growth Valley Consulting Pvt Ltd',
    foundedYear: 2020,
    teamSize: '10-50',
    description: 'B2B growth consulting firm specializing in marketing automation, CRM implementation, and revenue operations.'
  }
};

// Page SEO
const pageSEO = [
  {
    page: 'home',
    pageTitle: 'Growth Valley - B2B Growth Partners',
    seo: {
      metaTitle: 'Growth Valley | B2B Growth & Revenue Consulting',
      metaDescription: 'Transform your B2B company with Growth Valley. Expert consulting in marketing automation, CRM implementation, and revenue operations. Drive predictable growth.',
      keywords: ['B2B consulting', 'revenue operations', 'marketing automation', 'CRM implementation', 'growth consulting']
    },
    isActive: true
  },
  {
    page: 'solutions',
    pageTitle: 'Our Solutions - Growth Valley',
    seo: {
      metaTitle: 'B2B Growth Solutions | Growth Valley',
      metaDescription: 'Comprehensive solutions for B2B growth: lead generation, marketing automation, CRM implementation, and revenue operations.',
      keywords: ['lead generation', 'marketing automation services', 'CRM consulting', 'revenue operations']
    },
    isActive: true
  },
  {
    page: 'industries',
    pageTitle: 'Industries We Serve - Growth Valley',
    seo: {
      metaTitle: 'B2B Industries We Serve | Growth Valley',
      metaDescription: 'We specialize in helping SaaS, technology, finance, and healthcare companies achieve sustainable growth.',
      keywords: ['SaaS growth', 'technology marketing', 'fintech marketing', 'healthcare B2B']
    },
    isActive: true
  },
  {
    page: 'case-studies',
    pageTitle: 'Case Studies - Growth Valley',
    seo: {
      metaTitle: 'Client Success Stories | Growth Valley',
      metaDescription: 'Real results from real clients. See how we\'ve helped B2B companies achieve 2-3x growth in pipeline and revenue.',
      keywords: ['case studies', 'B2B success stories', 'marketing ROI', 'revenue growth']
    },
    isActive: true
  },
  {
    page: 'company',
    pageTitle: 'About Us - Growth Valley',
    seo: {
      metaTitle: 'About Growth Valley | Our Story & Team',
      metaDescription: 'Learn about Growth Valley\'s mission to help B2B companies achieve sustainable, predictable growth.',
      keywords: ['about growth valley', 'B2B consultants', 'growth experts', 'revenue consultants']
    },
    isActive: true
  },
  {
    page: 'contact',
    pageTitle: 'Contact Us - Growth Valley',
    seo: {
      metaTitle: 'Contact Growth Valley | Start Your Growth Journey',
      metaDescription: 'Ready to grow? Contact Growth Valley for a free consultation. We help B2B companies build predictable revenue engines.',
      keywords: ['contact', 'B2B consultation', 'growth assessment', 'free consultation']
    },
    isActive: true
  },
  {
    page: 'blog',
    pageTitle: 'Insights - Growth Valley',
    seo: {
      metaTitle: 'B2B Growth Insights & Resources | Growth Valley',
      metaDescription: 'Expert insights on B2B marketing, sales, and growth. Strategies, tactics, and trends from Growth Valley.',
      keywords: ['B2B marketing blog', 'growth strategies', 'sales insights', 'revenue operations']
    },
    isActive: true
  }
];

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/growthvalley');
    console.log('✅ Connected to MongoDB');

    // Get admin user for author
    const admin = await Admin.findOne({ role: 'admin' });
    if (!admin) {
      throw new Error('No admin user found. Please run /api/admin/init first.');
    }
    console.log(`👤 Using author: ${admin.email}`);

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      Blog.deleteMany({}),
      CaseStudy.deleteMany({}),
      Settings.deleteMany({}),
      PageSEO.deleteMany({}),
      TeamMember.deleteMany({})
    ]);

    // Add author to blog posts
    const blogPostsWithAuthor = blogPosts.map(post => ({
      ...post,
      author: admin._id
    }));

    // Create blog posts
    console.log('📝 Creating blog posts...');
    const createdBlogs = await Blog.insertMany(blogPostsWithAuthor);
    console.log(`   ✅ Created ${createdBlogs.length} blog posts`);

    // Create case studies
    console.log('📊 Creating case studies...');
    const createdCaseStudies = await CaseStudy.insertMany(caseStudies);
    console.log(`   ✅ Created ${createdCaseStudies.length} case studies`);

    // Create settings
    console.log('⚙️  Creating site settings...');
    await Settings.create(defaultSettings);
    console.log('   ✅ Created site settings');

    // Create page SEO
    console.log('🔍 Creating page SEO...');
    await PageSEO.insertMany(pageSEO);
    console.log('   ✅ Created page SEO settings');

    // Create team members
    console.log('👥 Creating team members...');
    const createdTeam = await TeamMember.insertMany(teamMembers);
    console.log(`   ✅ Created ${createdTeam.length} team members`);

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${createdBlogs.length} blog posts`);
    console.log(`   - ${createdCaseStudies.length} case studies`);
    console.log(`   - ${createdTeam.length} team members`);
    console.log(`   - Site settings configured`);
    console.log(`   - ${pageSEO.length} page SEO entries`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();