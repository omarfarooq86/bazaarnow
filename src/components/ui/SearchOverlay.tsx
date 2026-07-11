"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Package, TrendingUp, Grid3X3 } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/types";
import { formatPrice, getEffectivePrice, fuzzyMatch, findClosestMatch, getCategoryLabel } from "@/lib/utils";

// Slim index fields: s=slug, n=name, c=category, p=price, d=salePrice, i=image
interface SlimItem { s: string; n: string; c: string; p: number; d?: number; i: string; }
interface SearchItem { slug: string; name: string; category: string; price: number; salePrice?: number; image: string; }

let searchCache: SlimItem[] | null = null;
let categoryList: { slug: string; count: number }[] = [];
let searchPromise: Promise<void> | null = null;

// Start preloading immediately — called from module level
function preloadSearchIndex() {
  if (searchPromise) return;
  searchPromise = (async () => {
    try {
      const res = await fetch("/search-index-slim.json");
      searchCache = await res.json();
      // Build category list once
      const catCounts: Record<string, number> = {};
      searchCache!.forEach((p) => {
        catCounts[p.c] = (catCounts[p.c] || 0) + 1;
      });
      categoryList = Object.entries(catCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([slug, count]) => ({ slug, count }));
    } catch {}
  })();
}
preloadSearchIndex();

function expandItem(s: SlimItem): SearchItem {
  return { slug: s.s, name: s.n, category: s.c, price: s.p, salePrice: s.d, image: s.i };
}

async function searchProducts(query: string): Promise<Product[]> {
  if (!searchCache) {
    // Wait for preload if it hasn't finished
    try { const res = await fetch("/search-index-slim.json"); searchCache = await res.json(); } catch { return []; }
  }
  const lowerQuery = query.toLowerCase();
  return searchCache!
    .filter((p) => fuzzyMatch(lowerQuery, p.n) || fuzzyMatch(lowerQuery, p.c))
    .sort((a, b) => {
      const aExact = a.n.toLowerCase().includes(lowerQuery);
      const bExact = b.n.toLowerCase().includes(lowerQuery);
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    })
    .map((p) => {
      const item = expandItem(p);
      return { ...item, images: [item.image], description: "", features: [], specifications: {}, inStock: true, isFeatured: false, deliveryInfo: "" } as unknown as Product;
    });
}

async function getSuggestions(query: string): Promise<string[]> {
  if (!searchCache) {
    try { const res = await fetch("/search-index-slim.json"); searchCache = await res.json(); } catch { return []; }
  }
  return findClosestMatch(query, searchCache!.map((p) => p.n));
}

const POPULAR_SEARCHES = ["airpods", "watch", "charger", "handbag", "earbuds", "jacket", "tracksuit", "lipstick", "perfume"];
const POPULAR_CATEGORIES = [
  { slug: "fashion", icon: "👗" },
  { slug: "electronics", icon: "📱" },
  { slug: "beauty", icon: "💄" },
  { slug: "home-living", icon: "🏠" },
];

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [noResultsQuery, setNoResultsQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setSuggestions([]);
      setActiveCategory(null);
      setNoResultsQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  const doSearch = useCallback(async (q: string, cat: string | null) => {
    if (q.length < 2) {
      setResults([]);
      setSuggestions([]);
      setNoResultsQuery("");
      return;
    }
    setIsLoading(true);
    try {
      let items = await searchProducts(q);
      // Apply category filter
      if (cat) {
        items = items.filter((p) => p.category === cat);
      }
      setResults(items.slice(0, 8));
      if (items.length === 0) {
        setNoResultsQuery(q);
        const sug = await getSuggestions(q);
        setSuggestions(sug);
      } else {
        setSuggestions([]);
        setNoResultsQuery("");
      }
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback(
    (q: string) => {
      setQuery(q);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => doSearch(q, activeCategory), 300);
    },
    [activeCategory, doSearch]
  );

  const handleCategoryToggle = useCallback(
    (cat: string) => {
      const next = activeCategory === cat ? null : cat;
      setActiveCategory(next);
      doSearch(query, next);
    },
    [query, activeCategory, doSearch]
  );

  // Filtered results count by category (for chip display)
  const categoryHits: Record<string, number> = {};
  if (query.length >= 2 && !activeCategory) {
    results.forEach((p) => {
      categoryHits[p.category] = (categoryHits[p.category] || 0) + 1;
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 md:pt-24 px-4"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.15 }}
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
                placeholder="Search 1,964 products..."
                className="flex-1 text-base outline-none text-dark placeholder:text-charcoal-300 bg-transparent"
              />
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[0.6rem] font-mono text-charcoal-400 bg-charcoal-100 border border-charcoal-200">
                ESC
              </kbd>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-charcoal-50 text-charcoal-400 transition-colors"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category filter chips */}
            {(query.length >= 2 || activeCategory) && (
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-charcoal-50 overflow-x-auto">
                {categoryList.slice(0, 6).map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => handleCategoryToggle(cat.slug)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      activeCategory === cat.slug
                        ? "bg-brand-500 text-white shadow-sm"
                        : categoryHits[cat.slug]
                        ? "bg-brand-50 text-brand-600 hover:bg-brand-100"
                        : "bg-charcoal-50 text-charcoal-500 hover:bg-charcoal-100"
                    }`}
                  >
                    {getCategoryLabel(cat.slug)}
                    {categoryHits[cat.slug] ? (
                      <span className="ml-1 opacity-70">{categoryHits[cat.slug]}</span>
                    ) : null}
                  </button>
                ))}
                {activeCategory && (
                  <button
                    onClick={() => handleCategoryToggle(activeCategory)}
                    className="px-2 py-1.5 rounded-lg text-xs text-charcoal-400 hover:text-crimson-500 transition-colors"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            )}

            {/* Results area */}
            <div className="max-h-96 overflow-y-auto">
              {/* Empty state — popular searches */}
              {query.length < 2 && (
                <div className="p-5">
                  <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Popular Searches
                  </p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {POPULAR_SEARCHES.map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setQuery(term);
                          doSearch(term, activeCategory);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-charcoal-50 hover:bg-brand-50 hover:text-brand-600 text-sm text-charcoal-600 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Grid3X3 className="w-3.5 h-3.5" />
                    Browse Categories
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {POPULAR_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/category/${cat.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-2 p-3 rounded-xl bg-charcoal-50 hover:bg-brand-50 transition-colors"
                      >
                        <span className="text-lg">{cat.icon}</span>
                        <span className="text-sm font-medium text-dark">
                          {getCategoryLabel(cat.slug)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading */}
              {isLoading && (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              )}

              {/* No results + suggestions */}
              {!isLoading && query.length >= 2 && results.length === 0 && (
                <div className="p-6 text-center">
                  <Package className="w-10 h-10 text-charcoal-200 mx-auto mb-3" />
                  <p className="text-sm text-charcoal-500 font-medium">
                    No results for &quot;{noResultsQuery}&quot;
                  </p>
                  {suggestions.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-charcoal-400 mb-2">Did you mean:</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {suggestions.map((sug) => (
                          <button
                            key={sug}
                            onClick={() => {
                              setQuery(sug);
                              doSearch(sug, activeCategory);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 text-sm font-medium hover:bg-brand-100 transition-colors"
                          >
                            {sug.length > 50 ? sug.slice(0, 47) + "..." : sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {suggestions.length === 0 && (
                    <p className="text-xs text-charcoal-400 mt-2">
                      Try a shorter or different search term
                    </p>
                  )}
                </div>
              )}

              {/* Results */}
              {!isLoading && results.length > 0 && (
                <div className="p-2">
                  <p className="px-3 py-2 text-xs font-semibold text-charcoal-400 uppercase tracking-wider">
                    {results.length} result{results.length > 1 ? "s" : ""}
                    {activeCategory ? ` in ${getCategoryLabel(activeCategory)}` : ""}
                  </p>
                  {results.map((product, index) => {
                    const { current, original, hasDiscount } = getEffectivePrice(
                      product.price,
                      product.salePrice
                    );
                    return (
                      <motion.div
                        key={product.slug}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <Link
                          href={`/product/${product.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-4 p-3 rounded-xl hover:bg-charcoal-50 transition-colors group"
                        >
                          <div className="w-14 h-14 rounded-xl bg-charcoal-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {product.images[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-charcoal-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-dark group-hover:text-brand-600 transition-colors truncate">
                              {product.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-charcoal-400 capitalize">
                                {getCategoryLabel(product.category)}
                              </span>
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

            {/* Footer — View all */}
            {results.length > 0 && (
              <div className="p-3 border-t border-charcoal-100 bg-charcoal-50/50">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}${activeCategory ? `&category=${activeCategory}` : ""}`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
                >
                  View all results on search page
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
