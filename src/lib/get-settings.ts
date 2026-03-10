// Server-side settings fetching with caching
// This file runs on the server only and provides cached settings

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Cache settings for 5 minutes on the server
let cachedSettings: any = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Default settings (duplicated to avoid circular dependency)
const defaultSettings = {
  siteName: 'Growth Valley',
  siteTagline: 'Accelerate Your Growth',
  siteDescription: 'Predictable Revenue Systems for Scalable Businesses. We help B2B companies transform their revenue operations.',
  socialLinks: {
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: '',
    youtube: '',
  },
  hero: {
    title: '',
    subtitle: '',
    ctaText: '',
    ctaLink: '',
    backgroundImage: '',
  },
  footer: {
    copyrightText: '',
    links: [],
  },
  businessInfo: {
    legalName: '',
    taxId: '',
    foundedYear: null,
    teamSize: '',
    description: '',
    logo: '',
    logoDark: '',
  },
  tracking: {
    googleAnalytics: '',
    googleTagManager: '',
    facebookPixel: '',
  },
  customCss: '',
  customJs: '',
  maintenanceMode: false,
  favicon: '',
};

// Deep merge utility for nested objects
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T> | undefined): T {
  if (!source) return target;

  const result = { ...target };

  for (const key in source) {
    if (source[key] !== undefined && source[key] !== null) {
      if (
        typeof source[key] === 'object' &&
        !Array.isArray(source[key]) &&
        typeof target[key] === 'object' &&
        !Array.isArray(target[key])
      ) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key] as any;
      }
    }
  }

  return result;
}

/**
 * Fetch site settings from API with server-side caching
 * This should only be called from server components
 */
export async function getSettings(): Promise<typeof defaultSettings> {
  // Return cached settings if still valid
  if (cachedSettings && (Date.now() - cacheTimestamp) < CACHE_TTL) {
    return cachedSettings;
  }

  try {
    const response = await fetch(`${API_URL}/api/settings`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (response.ok) {
      const result = await response.json();

      if (result.success && result.data) {
        const mergedSettings = deepMerge(defaultSettings, result.data);
        cachedSettings = mergedSettings;
        cacheTimestamp = Date.now();
        return mergedSettings;
      }
    }
  } catch (error) {
    console.error('Failed to fetch settings:', error);
  }

  // Return defaults if API fails
  return defaultSettings;
}