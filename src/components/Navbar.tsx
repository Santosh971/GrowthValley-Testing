"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { useLogo } from "@/lib/settings-context";


const navigation = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/solutions" },
  { name: "Industries", href: "/industries" },
  { name: "Case Studies", href: "/case-studies" },
  { name: "Blog", href: "/blog" },
  { name: "About Us", href: "/company" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logo, hasLogo, siteName } = useLogo();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use Intersection Observer instead of scroll listener for better performance
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolled(!entry.isIntersecting);
      },
      {
        rootMargin: '-20px 0px 0px 0px',
        threshold: 0,
      }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Sentinel element for Intersection Observer */}
      <div ref={sentinelRef} className="absolute top-0 left-0 w-full h-1 pointer-events-none" />
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b transition-all duration-300 ${scrolled
          ? 'bg-white/98 dark:bg-brand-grey-950/98 shadow-sm border-brand-grey-200 dark:border-brand-grey-800'
          : 'bg-white/95 dark:bg-brand-grey-950/95 border-brand-grey-200 dark:border-brand-grey-800'
          }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              {mounted && hasLogo && logo ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={logo}
                    alt={siteName}
                    width={192}
                    height={80}
                    className="h-20 w-32 md:w-40 lg:w-48 object-contain"
                    priority
                  />
                </motion.div>
              ) : (
                <motion.span
                  className="text-2xl font-semibold tracking-tight text-brand-black dark:text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {siteName.split(' ')[0]}<span className="text-accent">{siteName.split(' ')[1] || ''}</span>
                </motion.span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className="relative text-body text-brand-grey-600 dark:text-brand-grey-400 hover:text-brand-black dark:hover:text-white transition-colors group"
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <ThemeToggle />
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href="/contact" className="btn-primary">
                  Schedule a Call
                </Link>
              </motion.div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center gap-2">
              <ThemeToggle />
              <motion.button
                type="button"
                className="p-2 text-brand-black dark:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
                    />
                  )}
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden overflow-hidden border-t border-brand-grey-200 dark:border-brand-grey-800"
              >
                <div className="py-4">
                  <div className="flex flex-col gap-1">
                    {navigation.map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <Link
                          href={item.href}
                          className="text-body text-brand-grey-600 dark:text-brand-grey-400 hover:text-brand-black dark:hover:text-white transition-colors py-3 block"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      </motion.div>
                    ))}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: navigation.length * 0.05 }}
                      className="mt-4"
                    >
                      <Link
                        href="/contact"
                        className="btn-primary text-center block"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Schedule a Call
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </motion.header>
    </>
  );
}