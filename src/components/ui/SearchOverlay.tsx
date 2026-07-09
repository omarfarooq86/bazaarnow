"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Package } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { getEffectivePrice } from "@/lib/utils";

interface SearchItem {
  slug: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number;
  image: string;
  tags: string[];
}

let searchCache: SearchItem[] | null = null;

async function searchProducts(query: string): Promise<Product[]> {
  if (!searchCache) {
    const res = await fetch("/search-index.json");
    searchCache = await res.json();
  }
  const lowerQuery = query.toLowerCase();
  return ((searchCache || []).filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      p.category.toLowerCase().includes(lowerQuery)
  )).map(p => ({
    ...p,
    images: [p.image],
    description: "",
    features: [],
    specifications: {},
    inStock: true,
    isFeatured: false,
    deliveryInfo: "",
  })) as unknown as Product[];
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const items = await searchProducts(q);
      setResults(items.slice(0, 8));
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 p-4 border-b border-charcoal-100">
              <Search className="w-5 h-5 text-charcoal-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search products, categories, brands..."
                className="flex-1 text-base outline-none text-dark placeholder:text-charcoal-300 bg-transparent"
              />
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-charcoal-50 text-charcoal-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {query.length < 2 && (
                <div className="p-8 text-center">
                  <Search className="w-10 h-10 text-charcoal-200 mx-auto mb-3" />
                  <p className="text-sm text-charcoal-400">
                    Type at least 2 characters to search
                  </p>
                </div>
              )}

              {isLoading && (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              )}

              {!isLoading && query.length >= 2 && results.length === 0 && (
                <div className="p-8 text-center">
                  <Package className="w-10 h-10 text-charcoal-200 mx-auto mb-3" />
                  <p className="text-sm text-charcoal-500 font-medium">
                    No products found
                  </p>
                  <p className="text-xs text-charcoal-400 mt-1">
                    Try a different search term
                  </p>
                </div>
              )}

              {!isLoading && results.length > 0 && (
                <div className="p-2">
                  <p className="px-3 py-2 text-xs font-semibold text-charcoal-400 uppercase tracking-wider">
                    {results.length} product{results.length > 1 ? "s" : ""} found
                  </p>
                  {results.map((product, index) => {
                    const { current, original, hasDiscount } = getEffectivePrice(
                      product.price,
                      product.salePrice
                    );
                    return (
                      <motion.div
                        key={product.slug}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                      >
                        <Link
                          href={`/product/${product.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-4 p-3 rounded-xl hover:bg-charcoal-50 transition-colors group"
                        >
                          <div className="w-14 h-14 rounded-xl bg-charcoal-100 flex items-center justify-center text-charcoal-300 text-xs flex-shrink-0 overflow-hidden">
                            {product.images[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-6 h-6" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-dark group-hover:text-brand-600 transition-colors truncate">
                              {product.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-sm font-bold text-brand-600">
                                {formatPrice(current)}
                              </span>
                              {hasDiscount && (
                                <span className="text-xs text-charcoal-400 price-strikethrough">
                                  {formatPrice(original)}
                                </span>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-charcoal-300 flex-shrink-0 group-hover:text-brand-500 transition-colors" />
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {results.length > 0 && (
              <div className="p-3 border-t border-charcoal-100 bg-charcoal-50/50">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
                >
                  View all results
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
