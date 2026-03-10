const mongoose = require('mongoose');

const socialLinksSchema = new mongoose.Schema({
  linkedin: { type: String, default: '' },
  twitter: { type: String, default: '' },
  facebook: { type: String, default: '' },
  instagram: { type: String, default: '' },
  youtube: { type: String, default: '' }
}, { _id: false });

const heroSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  ctaText: { type: String, default: '' },
  ctaLink: { type: String, default: '' },
  backgroundImage: { type: String, default: '' }
}, { _id: false });

const footerSchema = new mongoose.Schema({
  copyrightText: { type: String, default: '' },
  links: [{
    label: { type: String, required: true },
    url: { type: String, required: true }
  }]
}, { _id: false });

const businessInfoSchema = new mongoose.Schema({
  legalName: { type: String, default: '' },
  taxId: { type: String, default: '' },
  foundedYear: { type: Number, default: null },
  teamSize: { type: String, default: '' },
  description: { type: String, default: '' },
  logo: { type: String, default: '' },
  logoDark: { type: String, default: '' }
}, { _id: false });

const seoSchema = new mongoose.Schema({
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  keywords: [{ type: String }]
}, { _id: false });

const trackingSchema = new mongoose.Schema({
  googleAnalytics: { type: String, default: '' },
  googleTagManager: { type: String, default: '' },
  facebookPixel: { type: String, default: '' }
}, { _id: false });

const settingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: 'Growth Valley'
  },
  siteTagline: {
    type: String,
    default: 'Accelerate Your Growth'
  },
  siteDescription: {
    type: String,
    default: 'Predictable Revenue Systems for Scalable Businesses. We help B2B companies transform their revenue operations.'
  },
  socialLinks: {
    type: socialLinksSchema,
    default: () => ({})
  },
  hero: {
    type: heroSchema,
    default: () => ({})
  },
  footer: {
    type: footerSchema,
    default: () => ({})
  },
  businessInfo: {
    type: businessInfoSchema,
    default: () => ({})
  },
  seo: {
    type: seoSchema,
    default: () => ({})
  },
  tracking: {
    type: trackingSchema,
    default: () => ({})
  },
  customCss: {
    type: String,
    default: ''
  },
  customJs: {
    type: String,
    default: ''
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  favicon: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  minimize: false
});

// Ensure only one settings document exists
settingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Transform output - include _id for API responses
settingsSchema.methods.toJSON = function () {
  const settings = this.toObject();
  delete settings.__v;
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
