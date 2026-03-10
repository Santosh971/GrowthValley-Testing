import { getPageContent, getSection } from "@/lib/content";
import dynamic from "next/dynamic";

// Above-fold component - loaded with SSR for initial paint SEO
const AnimatedHeroSection = dynamic(
  () => import("@/components/AnimatedSections").then(m => m.AnimatedHeroSection),
  { ssr: true }
);

// Below-fold components - lazy loaded for performance
const AnimatedCredibilitySection = dynamic(
  () => import("@/components/AnimatedSections").then(m => m.AnimatedCredibilitySection),
  { ssr: false }
);

const AnimatedClientLogosSection = dynamic(
  () => import("@/components/AnimatedSections").then(m => m.AnimatedClientLogosSection),
  { ssr: false }
);

const AnimatedProblemSection = dynamic(
  () => import("@/components/AnimatedSections").then(m => m.AnimatedProblemSection),
  { ssr: false }
);

const AnimatedSolutionSection = dynamic(
  () => import("@/components/AnimatedSections").then(m => m.AnimatedSolutionSection),
  { ssr: false }
);

const AnimatedIndustriesSection = dynamic(
  () => import("@/components/AnimatedSections").then(m => m.AnimatedIndustriesSection),
  { ssr: false }
);

const AnimatedTestimonialsSection = dynamic(
  () => import("@/components/AnimatedSections").then(m => m.AnimatedTestimonialsSection),
  { ssr: false }
);

const AnimatedCaseStudyPreview = dynamic(
  () => import("@/components/AnimatedSections").then(m => m.AnimatedCaseStudyPreview),
  { ssr: false }
);

const AnimatedOperatingModel = dynamic(
  () => import("@/components/AnimatedSections").then(m => m.AnimatedOperatingModel),
  { ssr: false }
);

const AnimatedFinalCTA = dynamic(
  () => import("@/components/AnimatedSections").then(m => m.AnimatedFinalCTA),
  { ssr: false }
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Disable static generation for dynamic content
// export const dynamic = 'force-dynamic';
export const revalidate = 60;
// Fetch testimonials from API
async function getTestimonials() {
  try {
    const res = await fetch(`${API_URL}/api/testimonials?status=active`, {
      next: { revalidate: 60 }
    });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch {
    return [];
  }
}

// Fetch clients from API
async function getClients() {
  try {
    const res = await fetch(`${API_URL}/api/clients?status=active`, {
      next: { revalidate: 60 }
    });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch {
    return [];
  }
}

// Fetch featured case studies from API and transform for home page
async function getFeaturedCaseStudies() {
  try {
    // First try to get featured case studies
    const featuredRes = await fetch(`${API_URL}/api/case-studies/featured?limit=6`, {
      next: { revalidate: 60 }
    });
    const featuredData = await featuredRes.json();

    if (featuredData.success && featuredData.data && featuredData.data.length > 0) {
      // Transform featured case studies to match component format
      return featuredData.data.map((study: any) => ({
        client: study.clientName || study.title,
        industry: study.industry || 'Other',
        result: study.results?.[0]?.value || study.results?.[0]?.metric || '',
        description: study.challenge || study.solution || '',
        link: `/case-studies/${study.slug}`
      }));
    }

    // If no featured case studies, fetch all published case studies
    const allRes = await fetch(`${API_URL}/api/case-studies?limit=6`, {
      next: { revalidate: 60 }
    });
    const allData = await allRes.json();

    if (allData.success && allData.data) {
      // Transform all case studies to match component format
      return allData.data.map((study: any) => ({
        client: study.clientName || study.title,
        industry: study.industry || 'Other',
        result: study.results?.[0]?.value || study.results?.[0]?.metric || '',
        description: study.challenge || study.solution || '',
        link: `/case-studies/${study.slug}`
      }));
    }

    return [];
  } catch {
    return [];
  }
}

export default async function Home() {
  // Fetch dynamic content
  const content = await getPageContent('home');

  // Fetch testimonials, clients, and featured case studies in parallel
  const [testimonials, clients, featuredCaseStudies] = await Promise.all([
    getTestimonials(),
    getClients(),
    getFeaturedCaseStudies()
  ]);

  // Extract sections from content
  const hero = getSection(content, 'hero');
  const stats = getSection(content, 'stats');
  const problems = getSection(content, 'problems');
  const solutions = getSection(content, 'solutions');
  const industries = getSection(content, 'industries');
  const caseStudyPreviewContent = getSection(content, 'caseStudyPreview');
  const process = getSection(content, 'process');
  const cta = getSection(content, 'cta');

  // Merge CMS content with dynamic case studies
  // Use featured case studies from database if available, otherwise fall back to CMS content
  const caseStudyPreview = {
    title: caseStudyPreviewContent?.title || 'Results',
    subtitle: caseStudyPreviewContent?.subtitle || 'Real transformations. Real numbers.',
    items: featuredCaseStudies.length > 0
      ? featuredCaseStudies
      : (caseStudyPreviewContent?.items || [])
  };

  return (
    <>
      <AnimatedHeroSection hero={hero} />
      <AnimatedCredibilitySection stats={stats} />
      <AnimatedClientLogosSection clients={clients} />
      <AnimatedProblemSection problems={problems} />
      <AnimatedSolutionSection solutions={solutions} />
      <AnimatedIndustriesSection industries={industries} />
      <AnimatedTestimonialsSection testimonials={testimonials} />
      <AnimatedCaseStudyPreview caseStudyPreview={caseStudyPreview} />
      <AnimatedOperatingModel process={process} />
      <AnimatedFinalCTA cta={cta} />
    </>
  );
}