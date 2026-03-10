"use client";

import Container from "@/components/Container";
import Button from "@/components/Button";
import Link from "next/link";
import { motion } from "framer-motion";

interface CaseStudy {
  _id?: string;
  slug: string;
  title: string;
  challenge?: string;
  solution?: string;
}

// Interface for CTA section
interface CTASection {
  title: string;
  description: string;
  buttonText: string;
  buttonLink?: string;
}

interface CaseStudiesClientProps {
  featuredCaseStudies: CaseStudy[];
  otherCaseStudies: CaseStudy[];
  caseStudies: CaseStudy[];
  cta?: CTASection;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function CaseStudiesClient({
  featuredCaseStudies,
  otherCaseStudies,
  caseStudies,
  cta,
}: CaseStudiesClientProps) {
  return (
    <>
      <section className="relative py-20 bg-white dark:bg-brand-grey-950 overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern" />

        <Container className="relative z-10">
          {/* Case Studies Grid */}
          <motion.div
            className="grid sm:grid-cols-1 lg:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {caseStudies.map((cs) => (
              <motion.div
                key={cs._id || cs.slug}
                variants={itemVariants}
                whileHover={{
                  y: -8,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                }}
              >
                <Link
                  href={`/case-studies/${cs.slug}`}
                  className="block bg-white dark:bg-brand-grey-900 border border-brand-grey-200 dark:border-brand-grey-800 p-8 hover:border-accent transition-all duration-300 relative overflow-hidden rounded-lg"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5" />

                  <h3 className="text-heading-3 text-brand-black dark:text-white mb-4 relative z-10">
                    {cs.title}
                  </h3>

                  <p className="text-body text-brand-grey-500 dark:text-brand-grey-400 mb-6 relative z-10">
                    {cs.challenge?.substring(0, 200)}
                    {cs.challenge && cs.challenge.length > 200 ? '...' : ''}
                  </p>

                  <span className="text-label text-accent font-medium">
                    Read Case Study →
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {caseStudies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-body-lg text-brand-grey-500 dark:text-brand-grey-400">
                Case studies coming soon! Check back later.
              </p>
            </div>
          )}
        </Container>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-brand-grey-50 dark:bg-brand-grey-900">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-heading-2 text-brand-black dark:text-white mb-6">
              {cta?.title || "Want results like these?"}
            </h2>
            <p className="text-body-lg text-brand-grey-500 mb-10">
              {cta?.description || "Every transformation starts with a conversation. Let's discuss your revenue challenges."}
            </p>
            <Button href={cta?.buttonLink || "/contact"}>
              {cta?.buttonText || "Schedule a Call"}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}