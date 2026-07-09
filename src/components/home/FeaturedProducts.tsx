import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getFeaturedProducts } from "@/lib/products";
import ProductCard from "@/components/product/ProductCard";

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container-custom">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">
              Handpicked For You
            </span>
            <h2 className="heading-2 text-dark mt-1">Featured Products</h2>
          </div>
          <Link
            href="/offers"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => (
            <ProductCard key={product.slug} product={product} index={index} />
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link
            href="/offers"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500"
          >
            View All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
