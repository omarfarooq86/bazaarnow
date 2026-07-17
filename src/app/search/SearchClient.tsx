"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Package, TrendingUp, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/types";
import { fuzzyMatch, findClosestMatch, getCategoryLabel } from "@/lib/utils";
import ProductCard from "@/components/product/ProductCard";

// Slim index fields: s=slug, n=name, c=category, p=price, d=salePrice, i=image, v=videoUrl
interface SlimItem { s: string; n: string; c: string; p: number; d?: number; i: string; v?: string; }
interface SearchItem { slug: string; name: string; category: string; price: number; salePrice?: number; image: string; videoUrl?: string; }

let searchCache: SlimItem[] | null = null;

function expandItem(s: SlimItem): SearchItem {
  return { slug: s.s, name: s.n, category: s.c, price: s.p, salePrice: s.d, image: s.i, videoUrl: s.v || "" };
}

async function loadCache(): Promise<SlimItem[]> {
  if (!searchCache) {
    const res = await fetch("/search-index-slim.json");
    searchCache = await res.json();
  }
  return searchCache!;
}

async function searchAll(query: string): Promise<Product[]> {
  const cache = await loadCache();
  const lowerQuery = query.toLowerCase();
  return cache
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
      return { ...item, images: [item.image], videoUrl: item.videoUrl || "", description: "", features: [], specifications: {}, inStock: true, isFeatured: false, deliveryInfo: "" } as unknown as Product;
    });
}

async function getSuggestions(query: string): Promise<string[]> {
  const cache = await loadCache();
  return findClosestMatch(query, cache.map((p) => p.n));
}

type SortOpt = "relevance" | "price-low" | "price-high";

const POPULAR = ["airpods", "watch", "charger", "handbag", "earbuds", "jacket", "tracksuit", "lipstick"];

export default function SearchClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory || null);
  const [sort, setSort] = useState<SortOpt>("relevance");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string, cat: string | null) => {
    if (q.length < 2) {
      setResults([]);
      setSuggestions([]);
      setHasSearched(false);
      return;
    }
    setIsLoading(true);
    setHasSearched(true);
    try {
      let items = await searchAll(q);
      if (cat) items = items.filter((p) => p.category === cat);
      if (items.length === 0) {
        const sug = await getSuggestions(q);
        setSuggestions(sug);
      } else {
        setSuggestions([]);
      }
      setResults(items);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInput = useCallback(
    (val: string) => {
      setQuery(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => doSearch(val, activeCategory), 300);
    },
    [activeCategory, doSearch]
  );

  useEffect(() => {
    if (initialQuery) doSearch(initialQuery, initialCategory || null);
  }, []); // eslint-disable-line

  // Sort results
  const sorted = [...results].sort((a, b) => {
    const pa = a.salePrice ?? a.price;
    const pb = b.salePrice ?? b.price;
    if (sort === "price-low") return pa - pb;
    if (sort === "price-high") return pb - pa;
    return 0; // relevance (already sorted)
  });

  // Category counts from current result set
  const catCounts: Record<string, number> = {};
  results.forEach((p) => {
    catCounts[p.category] = (catCounts[p.category] || 0) + 1;
  });

  return (
    <div className="container-custom py-8">
      <div className="max-w-2xl mx-auto mb-6">
        <h1 className="heading-2 text-dark text-center mb-6">Search Products</h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="Search 1,964 products..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-charcoal-100 focus:border-brand-400 text-base outline-none transition-colors bg-white"
            autoFocus
          />
        </div>
      </div>

      {/* Empty state */}
      {!hasSearched && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-charcoal-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-dark mb-2">Search 1,964 Products</h2>
          <p className="text-charcoal-400 mb-6">Type at least 2 characters to search</p>
          <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Popular Searches
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {POPULAR.map((term) => (
              <button
                key={term}
                onClick={() => handleInput(term)}
                className="px-3 py-1.5 rounded-lg bg-charcoal-50 hover:bg-brand-50 hover:text-brand-600 text-sm text-charcoal-600 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category chips + sort */}
      {results.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-1.5">
            {Object.entries(catCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([slug, count]) => (
                <button
                  key={slug}
                  onClick={() => setActiveCategory(activeCategory === slug ? null : slug)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeCategory === slug
                      ? "bg-brand-500 text-white"
                      : "bg-charcoal-50 text-charcoal-600 hover:bg-brand-50 hover:text-brand-600"
                  }`}
                >
                  {getCategoryLabel(slug)} ({count})
                </button>
              ))}
          </div>
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-charcoal-400" />
            {(["relevance", "price-low", "price-high"] as SortOpt[]).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  sort === s ? "bg-brand-50 text-brand-600" : "text-charcoal-500 hover:text-dark"
                }`}
              >
                {s === "relevance" ? "Relevance" : s === "price-low" ? "Price ↓" : "Price ↑"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-charcoal-100 animate-pulse" />
          ))}
        </div>
      )}

      {/* No results */}
      {!isLoading && hasSearched && results.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-charcoal-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-dark mb-2">No products found</h2>
          <p className="text-charcoal-400 mb-4">
            No results for &quot;{query}&quot;. Try a different search term.
          </p>
          {suggestions.length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-charcoal-400 mb-2">Did you mean:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((sug) => (
                  <button
                    key={sug}
                    onClick={() => handleInput(sug)}
                    className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 text-sm font-medium hover:bg-brand-100 transition-colors"
                  >
                    {sug.length > 55 ? sug.slice(0, 52) + "..." : sug}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Link href="/" className="btn-primary inline-flex">
            Browse All Products
          </Link>
        </div>
      )}

      {/* Results */}
      {!isLoading && results.length > 0 && (
        <>
          <p className="text-sm text-charcoal-400 mb-6">
            {sorted.length} product{sorted.length !== 1 ? "s" : ""} found for &quot;{query}&quot;
            {activeCategory ? ` in ${getCategoryLabel(activeCategory)}` : ""}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {sorted.map((product, index) => (
              <ProductCard key={product.slug} product={product} index={index} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
