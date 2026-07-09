"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  Phone,
  Percent,
} from "lucide-react";
import { useCartStore } from "@/lib/cart";
import SearchOverlay from "@/components/ui/SearchOverlay";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const itemCount = useCartStore((s) => s.items.reduce((t, i) => t + i.quantity, 0));

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    setIsScrolled(currentScrollY > 20);
    setIsVisible(currentScrollY < lastScrollY || currentScrollY < 50);
    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/category/electronics", label: "Electronics" },
    { href: "/category/fashion", label: "Fashion" },
    { href: "/category/beauty", label: "Beauty" },
    { href: "/category/home-living", label: "Home" },
    { href: "/offers", label: "Offers", highlight: true },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "glass shadow-sm"
            : "bg-transparent"
        }`}
      >
        {/* Top bar — promo */}
        <div className="bg-dark text-white text-xs font-medium py-1.5 px-4 text-center overflow-hidden">
          <div className="flex items-center justify-center gap-2">
            <Percent className="w-3.5 h-3.5 text-gold-400" />
            <span className="hidden sm:inline">
              5% Discount on Advance Payment via JazzCash, EasyPaisa & Bank Transfer
            </span>
            <span className="sm:hidden">5% OFF on Advance Payment!</span>
            <Link
              href="/offers"
              className="text-gold-400 underline underline-offset-2 hover:text-gold-300 transition-colors ml-1"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Main navbar */}
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-button transition-transform group-hover:scale-105">
                B
              </div>
              <div>
                <h1 className="font-heading font-bold text-xl leading-tight text-dark">
                  Bazaar<span className="text-brand-500">Now</span>
                </h1>
                <p className="text-[0.6rem] text-charcoal-400 font-medium tracking-wider uppercase -mt-0.5">
                  Pakistan Ka Apna Bazaar
                </p>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    link.highlight
                      ? "bg-brand-500/10 text-brand-600 hover:bg-brand-500/20"
                      : "text-charcoal-600 hover:text-dark hover:bg-charcoal-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Search button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 rounded-xl text-charcoal-500 hover:text-dark hover:bg-charcoal-50 transition-all"
                aria-label="Search products"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Phone / WhatsApp */}
              <a
                href="tel:+923001234567"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-charcoal-600 hover:text-dark hover:bg-charcoal-50 transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>0300 1234567</span>
              </a>

              {/* Cart button */}
              <Link
                href="/cart"
                className="relative p-2.5 rounded-xl text-charcoal-500 hover:text-dark hover:bg-charcoal-50 transition-all"
                aria-label="View cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-crimson-500 text-white text-[0.65rem] font-bold rounded-full flex items-center justify-center shadow-md"
                  >
                    {itemCount > 9 ? "9+" : itemCount}
                  </motion.span>
                )}
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl text-charcoal-500 hover:text-dark hover:bg-charcoal-50 transition-all"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-light shadow-2xl overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <Link
                    href="/"
                    className="flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold">
                      B
                    </div>
                    <span className="font-heading font-bold text-lg text-dark">
                      Bazaar<span className="text-brand-500">Now</span>
                    </span>
                  </Link>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg text-charcoal-400 hover:text-dark hover:bg-charcoal-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                          link.highlight
                            ? "bg-brand-500/10 text-brand-600"
                            : "text-charcoal-700 hover:bg-charcoal-50"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-brand-50 rounded-2xl">
                  <p className="text-sm font-semibold text-brand-700 mb-1">
                    Need Help?
                  </p>
                  <a
                    href="tel:+923001234567"
                    className="text-sm text-brand-600 hover:underline"
                  >
                    0300 1234567
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
