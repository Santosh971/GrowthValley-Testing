import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { ThemeProvider } from '@/components';
import { AuthProvider } from '@/lib/auth-context';
import { SettingsProvider } from '@/lib/settings-context';
import MainLayout from '@/components/MainLayout';
import DynamicFavicon from '@/components/DynamicFavicon';
import { getSettings } from '@/lib/get-settings';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: 'Growth Valley | Predictable Revenue Systems',
    template: '%s | Growth Valley',
  },
  description: 'We design and manage end-to-end revenue infrastructure that turns marketing into measurable growth. Predictable revenue systems for scalable businesses.',
  keywords: ['revenue systems', 'growth consulting', 'funnel strategy', 'performance marketing', 'CRM automation', 'lead generation'],
  authors: [{ name: 'Growth Valley' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://growthvalley.in',
    siteName: 'Growth Valley',
    title: 'Growth Valley | Predictable Revenue Systems',
    description: 'We design and manage end-to-end revenue infrastructure that turns marketing into measurable growth.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Growth Valley',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Growth Valley | Predictable Revenue Systems',
    description: 'We design and manage end-to-end revenue infrastructure that turns marketing into measurable growth.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch settings on server-side with caching
  const initialSettings = await getSettings();

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white dark:bg-brand-grey-950 text-brand-black dark:text-white">
        <ThemeProvider>
          <AuthProvider>
            <SettingsProvider initialSettings={initialSettings}>
              <DynamicFavicon />
              <MainLayout>{children}</MainLayout>
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}