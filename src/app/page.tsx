import { Suspense } from "react";
import type { Metadata } from "next";
import HeroBanner from "@/components/home/HeroBanner";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import OfferBanner from "@/components/home/OfferBanner";
import { Banknote, Truck, ShieldCheck, RefreshCw } from "lucide-react";

/**
 * The homepage previously had no metadata of its own, so it inherited the root
 * layout's brand-only title ("BazaarNow — Pakistan Ka Apna Bazaar"), which targets
 * no search term at all. This gives the page the head term it should be competing
 * for.
 *
 * `absolute` is required: the root layout sets a "%s | BazaarNow" title template,
 * so a plain string here would render the brand twice.
 */
export const metadata: Metadata = {
  title: {
    absolute: "Online Shopping in Pakistan — Free Delivery, COD | BazaarNow",
  },
  description:
    "Online shopping in Pakistan at BazaarNow — cash on delivery, free nationwide delivery in 2-4 working days, 7-day returns and 5% off on advance payment.",
  openGraph: {
    title: "Online Shopping in Pakistan — BazaarNow",
    description:
      "Cash on delivery, free nationwide delivery in 2-4 working days, 7-day returns and 5% off when you pay in advance.",
  },
};

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <HeroBanner />

      {/* Trust bar */}
      <section className="bg-white border-y border-charcoal-100">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between overflow-x-auto gap-4 md:gap-8">
            {[
              { icon: Truck, label: "Free Delivery", sub: "Nationwide" },
              { icon: Banknote, label: "Cash on Delivery", sub: "Pay on Receipt" },
              { icon: ShieldCheck, label: "Secure Payment", sub: "100% Protected" },
              { icon: RefreshCw, label: "Easy Returns", sub: "7 Days Policy" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 flex-shrink-0"
              >
                <item.icon className="w-5 h-5 text-brand-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-dark whitespace-nowrap">
                    {item.label}
                  </p>
                  <p className="text-[0.65rem] text-charcoal-400 whitespace-nowrap">
                    {item.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <CategoryGrid />

      {/* Featured Products */}
      <Suspense
        fallback={
          <section className="py-12 bg-white">
            <div className="container-custom">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl bg-charcoal-100 animate-pulse"
                  />
                ))}
              </div>
            </div>
          </section>
        }
      >
        <FeaturedProducts />
      </Suspense>

      {/* 5% Offer Banner */}
      <OfferBanner />

      {/* About section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">
              Why Choose Us
            </span>
            {/* The page's only h1. The hero above rotates campaign headlines, so it
                is an h2 — two h1s on one page would just dilute both. */}
            <h1 className="heading-2 text-dark mt-2 mb-4">
              Online Shopping in Pakistan, Without the Guesswork
            </h1>
            <p className="text-charcoal-500 text-base leading-relaxed mb-8">
              BazaarNow is online shopping in Pakistan the way it should work:
              real products, real prices, no surprises. We stock fashion,
              electronics, beauty and home essentials, deliver free to 100+
              cities, and let you pay cash on delivery. Prefer to pay upfront?
              Take 5% off with JazzCash, EasyPaisa or bank transfer. Most orders
              arrive in 2-4 working days, and every one of them is covered by our
              7-day return policy.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 text-left">
              {[
                {
                  title: "Quality Guaranteed",
                  desc: "Every product is handpicked and quality-checked before shipping.",
                },
                {
                  title: "Fast Delivery",
                  desc: "Orders delivered in 2-4 working days to all major cities in Pakistan.",
                },
                {
                  title: "Trusted Payments",
                  desc: "COD, JazzCash, EasyPaisa & Bank Transfer — pay your way.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-5 rounded-2xl bg-cream-50 border border-charcoal-100"
                >
                  <h3 className="font-heading font-semibold text-dark mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-charcoal-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
