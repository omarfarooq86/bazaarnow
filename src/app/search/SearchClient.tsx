"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Package } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/types";
import { searchProducts } from "@/lib/products";
import ProductCard from "@/components/product/ProductCard";

export default function SearchClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setIsLoading(true);
    setHasSearched(true);
    try {
      const items = await searchProducts(q);
      setResults(items);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery, handleSearch]);

  return (
    <div className="container-custom py-8">
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="heading-2 text-dark text-center mb-6">Search Products</h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search products, categories, brands..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-charcoal-100 focus:border-brand-400 text-base outline-none transition-colors bg-white"
            autoFocus
          />
        </div>
      </div>

      {/* Results */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-2xl bg-charcoal-100 animate-pulse"
            />
          ))}
        </div>
      )}

      {!isLoading && hasSearched && results.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-charcoal-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-dark mb-2">No products found</h2>
          <p className="text-charcoal-400 mb-6">
            No results for &quot;{query}&quot;. Try a different search term.
          </p>
          <Link href="/" className="btn-primary inline-flex">
            Browse All Products
          </Link>
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <>
          <p className="text-sm text-charcoal-400 mb-6 text-center">
            {results.length} product{results.length !== 1 ? "s" : ""} found for &quot;{query}&quot;
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {results.map((product, index) => (
              <ProductCard key={product.slug} product={product} index={index} />
            ))}
          </div>
        </>
      )}

      {!hasSearched && (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-charcoal-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-dark mb-2">Search for Products</h2>
          <p className="text-charcoal-400">
            Type at least 2 characters to start searching.
          </p>
        </div>
      )}
    </div>
  );
}
