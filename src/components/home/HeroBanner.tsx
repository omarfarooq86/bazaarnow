"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { getBanners } from "@/lib/config";

export default function HeroBanner() {
  const banners = getBanners();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [progress, setProgress] = useState(0);

  const paginate = useCallback(
    (newDirection: number) => {
      setDirection(newDirection);
      setCurrent((prev) => (prev + newDirection + banners.length) % banners.length);
      setProgress(0);
    },
    [banners.length]
  );

  // Auto-play with smooth progress bar
  useEffect(() => {
    const interval = 50; // update every 50ms
    const totalDuration = 5000;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= totalDuration) {
          paginate(1);
          return 0;
        }
        return prev + interval;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [current, paginate]);

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 200 : -200,
      opacity: 0,
      scale: 0.98,
    }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({
      x: dir < 0 ? 200 : -200,
      opacity: 0,
      scale: 1.02,
    }),
  };

  const banner = banners[current];

  // Dynamic gradient based on bgColor
  const getGradient = (color: string) => {
    const gradients: Record<string, string> = {
      "#1A1A2E": "from-[#1A1A2E] via-[#252545] to-[#1A1A2E]",
      "#C41E3A": "from-[#C41E3A] via-[#8B1A2B] to-[#C41E3A]",
      "#0A2E1A": "from-[#0A2E1A] via-[#0D3D24] to-[#0A2E1A]",
      "#2D2D45": "from-[#2D2D45] via-[#3A3A5C] to-[#2D2D45]",
      "#7E2A11": "from-[#7E2A11] via-[#5C1F0C] to-[#7E2A11]",
    };
    return gradients[color] || `from-[${color}] via-[${color}] to-[${color}]`;
  };

  const stats = [
    { label: "Products", value: "1,419+" },
    { label: "Cities", value: "100+" },
    { label: "Categories", value: "7" },
    { label: "Discount", value: "5% Off" },
  ];

  return (
    <section className="relative">
      <div className="container-custom py-4 md:py-8">
        <div className="relative rounded-[2rem] overflow-hidden min-h-[480px] md:min-h-[560px] flex items-center">
          {/* Background with gradient + geometric pattern */}
          <div className="absolute inset-0 transition-all duration-1000" style={{ backgroundColor: banner.bgColor }}>
            {/* Mesh gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20" />

            {/* SVG geometric pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
                <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <rect width="100%" height="100%" fill="url(#dots)" opacity="0.5" />
            </svg>

            {/* Large decorative blobs */}
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-white/[0.07] to-transparent blur-3xl"
            />
            <motion.div
              animate={{ rotate: -360, scale: [1, 1.15, 1] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-1/3 -left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-brand-500/[0.15] to-transparent blur-3xl"
            />

            {/* Accent line top */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full"
            >
              <div className="grid lg:grid-cols-2 items-center gap-10 px-8 md:px-14 py-12 md:py-0">
                {/* Text content */}
                <div>
                  {/* Tagline chip */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-6"
                  >
                    <Sparkles className="w-3.5 h-3.5" style={{ color: banner.textColor }} />
                    <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: banner.textColor }}>
                      Pakistan Ka Apna Bazaar
                    </span>
                  </motion.div>

                  {/* Main heading */}
                  <motion.h1
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-black leading-[1.05] tracking-tight mb-5"
                    style={{ color: banner.textColor }}
                  >
                    {banner.title.split(" ").slice(0, 3).join(" ")}
                    <br />
                    <span className="opacity-80 font-semibold">
                      {banner.title.split(" ").slice(3).join(" ")}
                    </span>
                  </motion.h1>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="text-base md:text-lg opacity-70 mb-10 max-w-lg leading-relaxed"
                    style={{ color: banner.textColor }}
                  >
                    {banner.subtitle}
                  </motion.p>

                  {/* CTAs */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="flex flex-wrap gap-3 mb-10"
                  >
                    <Link
                      href={banner.ctaLink}
                      className="group relative inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-dark font-semibold text-sm hover:scale-[1.02] transition-all duration-200 shadow-xl shadow-black/20"
                    >
                      {banner.cta}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="/offers"
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold text-sm hover:bg-white/15 transition-all duration-200"
                    >
                      View Offers
                    </Link>
                  </motion.div>

                  {/* Stats row */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="flex flex-wrap gap-x-8 gap-y-3"
                  >
                    {stats.map((stat) => (
                      <div key={stat.label} className="text-center">
                        <p className="text-xl md:text-2xl font-heading font-bold" style={{ color: banner.textColor }}>
                          {stat.value}
                        </p>
                        <p className="text-[0.65rem] uppercase tracking-wider opacity-50" style={{ color: banner.textColor }}>
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Right side — product image */}
                <div className="hidden lg:flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                    className="relative"
                  >
                    {/* Glow behind image */}
                    <div
                      className="absolute inset-0 rounded-3xl blur-2xl opacity-30"
                      style={{ backgroundColor: banner.textColor }}
                    />
                    {/* Image container */}
                    <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl">
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                      />
                      {/* Subtle gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    </div>
                    {/* Floating badge */}
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -bottom-3 -left-3 px-4 py-2 rounded-xl bg-white text-dark shadow-lg"
                    >
                      <span className="text-xs font-bold">
                        {banner.ctaLink.includes("offers") ? "5% OFF" : "New Arrivals"}
                      </span>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation — glass buttons */}
          <button
            onClick={() => paginate(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 flex items-center justify-center text-white transition-all hover:scale-105 group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => paginate(1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 flex items-center justify-center text-white transition-all hover:scale-105 group"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Progress bar + dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > current ? 1 : -1);
                  setCurrent(i);
                  setProgress(0);
                }}
                className="relative w-12 h-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors overflow-hidden"
                aria-label={`Go to slide ${i + 1}`}
              >
                {i === current && (
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-white rounded-full"
                    style={{ width: `${(progress / 5000) * 100}%` }}
                    transition={{ duration: 0.05, ease: "linear" }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
