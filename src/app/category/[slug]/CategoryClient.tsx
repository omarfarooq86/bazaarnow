"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product, Category } from "@/types";
// Uses types only — no heavy imports
import ProductCard from "@/components/product/ProductCard";

interface CategoryClientProps {
  slug: string;
  category: Category;
  products: Product[];
}

type SortOption = "featured" | "price-low" | "price-high" | "name";

const PER_PAGE = 24;

export default function CategoryClient({
  slug,
  category,
  products,
}: CategoryClientProps) {
  const [sort, setSort] = useState<SortOption>("featured");
  const [page, setPage] = useState(1);

  // Reset to page 1 when sort or category changes
  useEffect(() => { setPage(1); }, [sort, slug]);

  const sortedProducts = [...products].sort((a, b) => {
    const priceA = a.salePrice ?? a.price;
    const priceB = b.salePrice ?? b.price;
    switch (sort) {
      case "price-low":
        return priceA - priceB;
      case "price-high":
        return priceB - priceA;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "featured", label: "Featured" },
    { value: "price-low", label: "Price: Low" },
    { value: "price-high", label: "Price: High" },
    { value: "name", label: "Name" },
  ];

  return (
    <>
      {/* Category header */}
      <section className="bg-dark">
        <div className="container-custom py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-charcoal-300 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="heading-1 text-white mb-2">{category.name}</h1>
          <p className="text-charcoal-300 text-base max-w-xl">
            {category.description}
          </p>
          <p className="text-charcoal-400 text-sm mt-3">
            {products.length} product{products.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </section>

      {/* Products grid */}
      <section className="py-10">
        <div className="container-custom">
          {/* Sort bar */}
          <div className="flex items-center gap-2 mb-8">
            <span className="text-xs text-charcoal-400 font-medium mr-1">
              Sort by:
            </span>
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  sort === opt.value
                    ? "bg-brand-50 text-brand-600"
                    : "text-charcoal-500 hover:text-dark"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {sortedProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-charcoal-400 text-lg font-medium">
                No products found in this category yet.
              </p>
              <Link
                href="/"
                className="text-brand-500 hover:text-brand-600 font-semibold mt-2 inline-block"
              >
                Browse other categories
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {sortedProducts
                  .slice((page - 1) * PER_PAGE, page * PER_PAGE)
                  .map((product, index) => (
                    <ProductCard
                      key={product.slug}
                      product={product}
                      index={index}
                    />
                  ))}
              </div>

              {/* Pagination */}
              {sortedProducts.length > PER_PAGE && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-charcoal-200 hover:bg-charcoal-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from(
                    { length: Math.ceil(sortedProducts.length / PER_PAGE) },
                    (_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                          page === i + 1
                            ? "bg-brand-500 text-white shadow-md"
                            : "border border-charcoal-200 hover:bg-charcoal-50 text-charcoal-600"
                        }`}
                      >
                        {i + 1}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setPage(
                        Math.min(
                          Math.ceil(sortedProducts.length / PER_PAGE),
                          page + 1
                        )
                      )
                    }
                    disabled={
                      page === Math.ceil(sortedProducts.length / PER_PAGE)
                    }
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-charcoal-200 hover:bg-charcoal-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* BreadcrumbList structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://www.bazaarnow.net",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: category.name,
                item: `https://www.bazaarnow.net/category/${category.slug}`,
              },
            ],
          }),
        }}
      />
    </>
  );
}
