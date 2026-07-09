import type { Metadata } from "next";
import {
  Truck,
  ShieldCheck,
  Banknote,
  RefreshCw,
  HeadphonesIcon,
  Star,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about BazaarNow — Pakistan's most trusted online marketplace. Premium products, fast delivery, and secure payments.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-dark py-16">
        <div className="container-custom text-center">
          <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
            Our Story
          </span>
          <h1 className="heading-1 text-white mt-2 mb-4">
            About BazaarNow
          </h1>
          <p className="text-charcoal-300 text-base max-w-2xl mx-auto">
            Pakistan&apos;s most trusted online marketplace — bringing premium
            quality products to your doorstep with fast, free delivery nationwide.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container-custom max-w-4xl">
          <div className="grid md:grid-cols-2 gap-10 mb-16">
            <div>
              <h2 className="heading-2 text-dark mb-4">Our Mission</h2>
              <p className="text-charcoal-500 leading-relaxed">
                At BazaarNow, we believe every Pakistani deserves access to
                quality products at fair prices. We carefully curate every item
                in our catalog, ensuring you get the best value for your money
                — delivered straight to your door.
              </p>
            </div>
            <div>
              <h2 className="heading-2 text-dark mb-4">Why We Started</h2>
              <p className="text-charcoal-500 leading-relaxed">
                We saw a gap in Pakistan&apos;s e-commerce landscape — overpriced
                products, unreliable delivery, and limited payment options.
                BazaarNow was born to solve these problems with a simple promise:
                quality products, honest prices, and seamless service.
              </p>
            </div>
          </div>

          {/* Values */}
          <h2 className="heading-2 text-dark text-center mb-10">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: Star,
                title: "Quality First",
                desc: "Every product is handpicked and quality-checked before it reaches you.",
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                desc: "Orders shipped within 24 hours, delivered in 2-4 working days to all major cities.",
              },
              {
                icon: Banknote,
                title: "Fair Pricing",
                desc: "No hidden charges. Transparent pricing with regular discounts and offers.",
              },
              {
                icon: ShieldCheck,
                title: "Secure Shopping",
                desc: "Your data is safe. All payments are processed through trusted channels.",
              },
              {
                icon: RefreshCw,
                title: "Easy Returns",
                desc: "Not satisfied? Return within 7 days — no questions asked.",
              },
              {
                icon: HeadphonesIcon,
                title: "24/7 Support",
                desc: "Always here to help via WhatsApp, phone, or email.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-2xl bg-white border border-charcoal-100 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-brand-500" />
                </div>
                <h3 className="font-heading font-semibold text-dark mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-charcoal-500">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Return Policy */}
          <div className="rounded-2xl bg-white border border-charcoal-100 p-8 mb-8">
            <h2 className="heading-2 text-dark mb-4">Return & Exchange Policy</h2>
            <div className="prose text-sm text-charcoal-600 space-y-3">
              <p>
                We want you to be completely satisfied with your purchase. If
                you&apos;re not happy with your order, you can return or exchange
                it within 7 days of delivery.
              </p>
              <p>
                <strong>Conditions for Returns:</strong>
              </p>
              <ul className="space-y-1 ml-4">
                <li>Item must be unused, unwashed, and in original packaging</li>
                <li>All tags and labels must be intact</li>
                <li>Return must be initiated within 7 days of delivery</li>
                <li>For hygiene reasons, certain items (undergarments, cosmetics) cannot be returned once opened</li>
              </ul>
              <p>
                <strong>How to Return:</strong> Contact us via WhatsApp at
                0300 1234567 or email hello@bazaarnow.pk. Our team will guide
                you through the process.
              </p>
            </div>
          </div>

          {/* FAQ structured data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "What is the return policy?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "You can return or exchange items within 7 days of delivery. Items must be unused and in original packaging.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "What payment methods do you accept?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "We accept Cash on Delivery, JazzCash, EasyPaisa, and Bank Transfer. 5% discount on advance payments.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "How long does delivery take?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Orders are delivered in 2-4 working days to all major cities in Pakistan.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Is delivery free?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes, we offer free delivery on all orders across Pakistan.",
                    },
                  },
                ],
              }),
            }}
          />
        </div>
      </section>
    </>
  );
}
