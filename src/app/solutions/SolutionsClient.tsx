"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Container from "@/components/Container";
import Button from "@/components/Button";
import { motion } from "framer-motion";

interface Solution {
  id: string;
  title: string;
  description: string;
  features: string[] | string | null | undefined;
  outcomes: string[] | string | null | undefined;
}

/**
 * Safely convert features/outcomes to an array
 * Handles: array (returns as-is), string (splits by comma), null/undefined (returns empty array)
 */
function toArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string') {
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }
  return [];
}

interface SolutionsClientProps {
  hero: { title: string; description: string } | null;
  solutions: Solution[] | null;
  cta: { title: string; description: string; buttonText: string; buttonLink: string } | null;
}


// Icon components for solutions
const solutionIcons: Record<string, React.ReactNode> = {
  'revenue-architecture': (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  ),
  'sales-process': (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.108 1.922c.227.394.134.905-.215 1.179l-.928.678a1.125 1.125 0 00-.398 1.026c.036.147.055.299.055.456v.227c0 .157-.02.31-.055.456a1.125 1.125 0 00.398 1.027l.928.677a1.125 1.125 0 01.215 1.179l-1.108 1.922a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.58.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.622 6.622 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.108-1.922a1.125 1.125 0 01.215-1.179l.928-.678a1.125 1.125 0 00.398-1.026 3.86 3.86 0 010-.456v-.227c0-.157.02-.31.055-.456a1.125 1.125 0 00-.398-1.027l-.928-.677a1.125 1.125 0 01-.215-1.179l1.108-1.922a1.125 1.125 0 011.37-.49l1.217.456c.355.133.75.072 1.075-.124.074-.044.147-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  'revops': (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  'gtm': (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.702-1.081-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.9 17.9 0 0112 16.5c-3.162 0-6.133-.868-8.716-2.387m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
};


export default function SolutionsClient({ hero, solutions, cta }: SolutionsClientProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Handle smooth scroll to hash section when navigating with hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  return (
    <>
      <section className="relative py-20 bg-white dark:bg-brand-grey-950 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-dot-pattern" />

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 right-1/4 w-4 h-4 bg-accent/20 rotate-45"
          animate={{ rotate: [45, 90, 45], y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 left-10 w-3 h-3 bg-accent/15 rounded-full"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />


        <Container className="relative z-10">
          <div className="space-y-32">
            {solutions?.map((solution, index) => (
              <motion.div
                key={solution.id}
                id={solution.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
              >
                <div>
                  <motion.div
                    className="text-accent mb-6"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {solutionIcons[solution.id] || solutionIcons['revenue-architecture']}
                  </motion.div>
                  <h2 className="text-heading-2 text-brand-black dark:text-white mb-4">
                    {solution.title || 'Untitled Solution'}
                  </h2>
                  <p className="text-body-lg text-left text-brand-grey-500 dark:text-brand-grey-400 mb-8">
                    {solution.description || ''}
                  </p>

                  <div className="mb-8">
                    <h4 className="text-label text-brand-grey-400 dark:text-brand-grey-500 uppercase mb-4">
                      What We Deliver
                    </h4>
                    <ul className="space-y-3">
                      {toArray(solution.features).map((feature, idx) => (
                        <motion.li
                          key={idx}
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <motion.svg
                            className="w-5 h-5 text-accent mt-1 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            whileHover={{ scale: 1.2 }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </motion.svg>
                          <span className="text-body text-brand-grey-600 dark:text-brand-grey-300">
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <Button href="/contact">Learn More</Button>
                </div>

                <motion.div
                  className="bg-brand-grey-50 dark:bg-brand-grey-900 p-8 relative overflow-hidden"
                  whileHover={{ boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <h4 className="text-label text-brand-grey-400 dark:text-brand-grey-500 uppercase mb-6">
                    Expected Outcomes
                  </h4>
                  <div className="space-y-4">
                    {toArray(solution.outcomes).map((outcome, idx) => (
                      <motion.div
                        key={idx}
                        className="flex items-center gap-4 border-b border-brand-grey-200 dark:border-brand-grey-700 pb-4 last:border-0 last:pb-0"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 + 0.2 }}
                      >
                        <motion.span
                          className="text-heading-4 text-accent"
                          whileHover={{ scale: 1.2 }}
                        >
                          ✓
                        </motion.span>
                        <span className="text-body-lg text-brand-black dark:text-white">
                          {outcome}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-brand-grey-50 dark:bg-brand-grey-900 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-animated-gradient" />

        {/* Floating Shapes */}
        <motion.div
          className="absolute top-10 left-1/4 w-4 h-4 bg-accent/30 rounded-full"
          animate={{ y: [0, -30, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-1/3 w-3 h-3 bg-accent/25 rotate-45"
          animate={{ rotate: [45, 90, 45] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        <Container className="relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-heading-2 text-brand-black dark:text-white mb-6">
              {cta?.title || "Not sure which solution you need?"}
            </h2>
            <p className="text-body-lg text-center whitespace-nowrap text-brand-grey-500 dark:text-brand-grey-400 mb-10">
              {cta?.description || "Our discovery process identifies the highest-impact opportunities for your specific situation."}
            </p>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button href={cta?.buttonLink || "/contact"}>
                {cta?.buttonText || "Schedule a Discovery Call"}
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </section>
    </>
  );
}