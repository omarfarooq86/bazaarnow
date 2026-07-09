"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Percent, ArrowRight, Smartphone, Building2 } from "lucide-react";

export default function OfferBanner() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return (
    <section className="py-12 md:py-16">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl bg-dark overflow-hidden p-8 md:p-12"
        >
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gold-500/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />

          <div className="relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-500/20 text-gold-400 text-xs font-semibold uppercase tracking-wider mb-4"
                >
                  <Percent className="w-3.5 h-3.5" />
                  Special Offer
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 }}
                  className="heading-2 text-white mb-4"
                >
                  5% Discount on
                  <br />
                  <span className="text-gold-400">Advance Payment</span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                  className="text-charcoal-300 text-base max-w-md mb-6"
                >
                  Pay via JazzCash, EasyPaisa, or Bank Transfer and save 5% on
                  your entire order. Instant discount applied at checkout!
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 }}
                  className="flex flex-wrap gap-3 mb-6"
                >
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-sm">
                    <Smartphone className="w-4 h-4 text-brand-400" />
                    JazzCash
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-sm">
                    <Smartphone className="w-4 h-4 text-brand-400" />
                    EasyPaisa
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-sm">
                    <Building2 className="w-4 h-4 text-brand-400" />
                    Bank Transfer
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                >
                  <Link
                    href="/offers"
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    View 5% Discount Offer
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>

              {/* Visual side */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                    className="w-48 h-48 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-gold"
                  >
                    <div className="text-center">
                      <span className="block text-5xl font-heading font-black text-dark">
                        5%
                      </span>
                      <span className="block text-sm font-semibold text-dark/70">
                        OFF
                      </span>
                    </div>
                  </motion.div>
                  {/* Orbiting dots */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-gold-400"
                      style={{
                        transformOrigin: `-${72 + i * 16}px center`,
                      }}
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 8 + i * 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
