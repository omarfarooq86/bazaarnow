import type { Metadata } from "next";
import { getFeaturedProducts } from "@/lib/products";
import ProductCard from "@/components/product/ProductCard";
import { Percent, Smartphone, Building2, Banknote, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Special Offers & Discounts",
  description:
    "Get 5% off on advance payments via JazzCash, EasyPaisa & Bank Transfer. Browse featured products at discounted prices.",
};

export default async function OffersPage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      {/* Hero */}
      <section className="bg-dark py-16">
        <div className="container-custom text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Percent className="w-3.5 h-3.5" />
            Special Offers
          </span>
          <h1 className="heading-1 text-white mb-4">
            5% Discount on Advance Payment
          </h1>
          <p className="text-charcoal-300 text-base max-w-2xl mx-auto mb-8">
            Pay via JazzCash, EasyPaisa, or Bank Transfer and save 5% on every
            order. Instant discount applied at checkout!
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium">
              <Smartphone className="w-4 h-4 text-brand-400" />
              JazzCash
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium">
              <Smartphone className="w-4 h-4 text-brand-400" />
              EasyPaisa
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium">
              <Building2 className="w-4 h-4 text-brand-400" />
              Bank Transfer
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <h2 className="heading-2 text-dark text-center mb-10">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              {
                step: "01",
                title: "Add to Cart",
                desc: "Browse our products and add your favorites to the cart.",
              },
              {
                step: "02",
                title: "Choose Advance Payment",
                desc: "At checkout, select Advance Payment to unlock your 5% discount.",
              },
              {
                step: "03",
                title: "Save Instantly",
                desc: "The 5% discount is automatically applied to your order total.",
              },
            ].map((item, i) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-heading font-bold text-brand-500">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-heading font-semibold text-dark mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-charcoal-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="py-12">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">
                Hot Deals
              </span>
              <h2 className="heading-2 text-dark mt-1">Featured Products</h2>
            </div>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product, index) => (
                <ProductCard key={product.slug} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-charcoal-400">No featured products at the moment. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
