import { Suspense } from "react";
import HeroBanner from "@/components/home/HeroBanner";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import OfferBanner from "@/components/home/OfferBanner";
import { Banknote, Truck, ShieldCheck, RefreshCw } from "lucide-react";

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
            <h2 className="heading-2 text-dark mt-2 mb-4">
              Pakistan&apos;s Most Trusted Online Bazaar
            </h2>
            <p className="text-charcoal-500 text-base leading-relaxed mb-8">
              We bring you premium quality products at the best prices with free
              delivery across Pakistan. Shop with confidence — pay cash on
              delivery or get 5% off on advance payments via JazzCash, EasyPaisa
              or bank transfer.
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
