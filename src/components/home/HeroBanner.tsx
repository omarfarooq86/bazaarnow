"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getBanners } from "@/lib/config";
import type { Banner } from "@/types";

export default function HeroBanner() {
  const banners = getBanners();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrent(
      (prev) => (prev + newDirection + banners.length) % banners.length
    );
  };

  useEffect(() => {
    const timer = setInterval(() => paginate(1), 5000);
    return () => clearInterval(timer);
  }, []);

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const banner = banners[current];

  return (
    <section className="relative overflow-hidden">
      <div className="container-custom py-6 md:py-10">
        <div className="relative rounded-3xl overflow-hidden min-h-[420px] md:min-h-[500px] flex items-center">
          {/* Background */}
          <div
            className="absolute inset-0 transition-colors duration-700"
            style={{ backgroundColor: banner.bgColor }}
          >
            {/* Hero product image — loaded lazily, hidden on mobile */}
            {banner.image && (
              <img
                src={banner.image}
                alt=""
                className="hidden md:block absolute right-0 top-0 w-1/2 h-full object-cover opacity-25"
                loading="lazy"
                decoding="async"
              />
            )}
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
            <div className="absolute top-1/4 left-1/2 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl" />
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="relative z-10 w-full"
            >
              <div className="grid md:grid-cols-2 items-center gap-8 px-6 md:px-12 py-10 md:py-0">
                {/* Text content */}
                <div>
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider mb-4"
                    style={{ color: banner.textColor }}
                  >
                    New Collection 2026
                  </motion.span>
                  <motion.h2
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="heading-1 mb-4"
                    style={{ color: banner.textColor }}
                  >
                    {banner.title}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="text-base md:text-lg opacity-80 mb-8 max-w-md"
                    style={{ color: banner.textColor }}
                  >
                    {banner.subtitle}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="flex flex-wrap gap-3"
                  >
                    <Link
                      href={banner.ctaLink}
                      className="btn-primary text-sm md:text-base"
                      style={{
                        backgroundColor:
                          banner.bgColor === "#FF6B35"
                            ? "var(--color-dark)"
                            : "var(--color-brand-500)",
                      }}
                    >
                      {banner.cta}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/offers"
                      className="btn-outline text-sm md:text-base"
                      style={{
                        borderColor: banner.textColor,
                        color: banner.textColor,
                      }}
                    >
                      View Offers
                    </Link>
                  </motion.div>
                </div>

                {/* Image / illustration placeholder */}
                <div className="hidden md:flex items-center justify-center">
                  <div
                    className="w-72 h-72 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor:
                        "rgba(255,255,255,0.08)",
                    }}
                  >
                    <div
                      className="w-56 h-56 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor:
                          "rgba(255,255,255,0.1)",
                      }}
                    >
                      <span
                        className="text-8xl font-heading font-black opacity-30 select-none"
                        style={{ color: banner.textColor }}
                      >
                        BN
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows */}
          <button
            onClick={() => paginate(-1)}
            className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center text-white transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => paginate(1)}
            className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center text-white transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > current ? 1 : -1);
                  setCurrent(i);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-8 bg-white"
                    : "bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
