"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Smartphone,
  Shirt,
  Home,
  Sparkles,
  Dumbbell,
  Baby,
  UtensilsCrossed,
  ShoppingBasket,
  ArrowRight,
  LucideIcon,
} from "lucide-react";
import { getCategories } from "@/lib/config";

const iconMap: Record<string, LucideIcon> = {
  Smartphone,
  Shirt,
  Home,
  Sparkles,
  Dumbbell,
  Baby,
  UtensilsCrossed,
  ShoppingBasket,
};

export default function CategoryGrid() {
  const categories = getCategories();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <section className="py-12 md:py-16">
      <div className="container-custom">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">
              Shop By
            </span>
            <h2 className="heading-2 text-dark mt-1">Categories</h2>
          </div>
          <Link
            href="/offers"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => {
            const Icon = iconMap[category.icon] || ShoppingBasket;
            return (
              <motion.div
                key={category.slug}
                initial={mounted ? { opacity: 0, y: 24 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: mounted ? index * 0.06 : 0 }}
              >
                <Link
                  href={`/category/${category.slug}`}
                  className="group relative flex flex-col items-center p-6 rounded-2xl bg-white border border-charcoal-100 hover:border-brand-200 hover:shadow-card-hover transition-all duration-300 text-center"
                >
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors duration-300">
                    <Icon className="w-7 h-7 text-brand-500 group-hover:text-brand-600 transition-colors" />
                  </div>

                  {/* Category name */}
                  <h3 className="text-sm font-semibold text-dark mb-1 group-hover:text-brand-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-charcoal-400">
                    {category.productCount}+ Products
                  </p>

                  {/* Hover indicator */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-brand-500 rounded-full group-hover:w-12 transition-all duration-300" />
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-6 sm:hidden">
          <Link
            href="/offers"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500"
          >
            View All Categories
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
