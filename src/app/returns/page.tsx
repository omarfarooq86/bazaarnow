import type { Metadata } from "next";
import { RefreshCw, ShieldCheck, Truck, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Return & Exchange Policy",
  description:
    "Learn about BazaarNow's return, exchange, and refund policy. 7-day return window, full refund on damaged items.",
};

export default function ReturnsPage() {
  return (
    <>
      <section className="bg-dark py-16">
        <div className="container-custom text-center">
          <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
            Our Policy
          </span>
          <h1 className="heading-1 text-white mt-2 mb-4">
            Return & Exchange Policy
          </h1>
          <p className="text-charcoal-300 text-base max-w-2xl mx-auto">
            We want you to be completely satisfied with every purchase. Here&apos;s
            everything you need to know about returns, exchanges, and refunds.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-custom max-w-3xl">
          {/* Quick summary cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {[
              {
                icon: Clock,
                title: "7-Day Return Window",
                desc: "Initiate a return within 7 days of receiving your order.",
              },
              {
                icon: RefreshCw,
                title: "Easy Exchange",
                desc: "Exchange for a different size, color, or product of equal value.",
              },
              {
                icon: ShieldCheck,
                title: "Full Refund on Damages",
                desc: "If the product arrives damaged or not as advertised, get a full refund.",
              },
              {
                icon: Truck,
                title: "Free Return Pickup",
                desc: "We arrange free pickup for eligible returns in major cities.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-5 rounded-2xl bg-white border border-charcoal-100"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-3">
                  <item.icon className="w-5 h-5 text-brand-500" />
                </div>
                <h3 className="font-heading font-semibold text-dark text-sm mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-charcoal-500">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Detailed policy */}
          <div className="space-y-8">
            <div className="rounded-2xl bg-white border border-charcoal-100 p-6">
              <h2 className="heading-3 text-dark mb-4">Conditions for Returns</h2>
              <ul className="space-y-2 text-sm text-charcoal-600">
                <li className="flex gap-2">
                  <span className="text-brand-500 font-bold">•</span>
                  Item must be unused, unwashed, and in its original packaging with all tags intact.
                </li>
                <li className="flex gap-2">
                  <span className="text-brand-500 font-bold">•</span>
                  Return request must be initiated within 7 days of delivery.
                </li>
                <li className="flex gap-2">
                  <span className="text-brand-500 font-bold">•</span>
                  Original invoice or order confirmation must be provided.
                </li>
                <li className="flex gap-2">
                  <span className="text-brand-500 font-bold">•</span>
                  For hygiene reasons, certain items (undergarments, cosmetics, personal care products) cannot be returned once opened.
                </li>
                <li className="flex gap-2">
                  <span className="text-brand-500 font-bold">•</span>
                  Sale or clearance items are final sale and cannot be returned unless damaged.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white border border-charcoal-100 p-6">
              <h2 className="heading-3 text-dark mb-4">How to Return an Item</h2>
              <ol className="space-y-3 text-sm text-charcoal-600">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-500 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <span>Contact us via WhatsApp at <strong>+92 310 1418307</strong> or email <strong>omee00@gmail.com</strong> with your order details and reason for return.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-500 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <span>Our team will review your request and provide return instructions within 24 hours.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-500 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <span>Pack the item securely in its original packaging and hand it over to our pickup partner (free in major cities).</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-500 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                  <span>Once we receive and inspect the item, we will process your refund or exchange within 3-5 working days.</span>
                </li>
              </ol>
            </div>

            <div className="rounded-2xl bg-white border border-charcoal-100 p-6">
              <h2 className="heading-3 text-dark mb-4">Refunds</h2>
              <ul className="space-y-2 text-sm text-charcoal-600">
                <li className="flex gap-2">
                  <span className="text-brand-500 font-bold">•</span>
                  Refunds are processed within 3-5 working days after the returned item is received and inspected.
                </li>
                <li className="flex gap-2">
                  <span className="text-brand-500 font-bold">•</span>
                  For advance payments (JazzCash, EasyPaisa, Bank Transfer), the refund will be sent back to the original payment method.
                </li>
                <li className="flex gap-2">
                  <span className="text-brand-500 font-bold">•</span>
                  For Cash on Delivery orders, refunds are processed via JazzCash, EasyPaisa, or bank transfer — whichever is convenient for you.
                </li>
                <li className="flex gap-2">
                  <span className="text-brand-500 font-bold">•</span>
                  If the product is damaged or not as advertised, we cover the full refund including any shipping charges you may have paid.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white border border-charcoal-100 p-6">
              <h2 className="heading-3 text-dark mb-4">Exchanges</h2>
              <p className="text-sm text-charcoal-600 mb-3">
                You can exchange your item for a different size, color, or another product of equal or lesser value. If the new item costs more, you will need to pay the difference. If it costs less, the difference will be refunded.
              </p>
              <p className="text-sm text-charcoal-600">
                Exchanges follow the same process as returns. Contact us via WhatsApp or email to initiate an exchange.
              </p>
            </div>
          </div>
        </div>
      </section>

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
                  text: "You can return or exchange items within 7 days of delivery. Items must be unused and in original packaging. Contact us via WhatsApp at +92 310 1418307 to initiate a return.",
                },
              },
              {
                "@type": "Question",
                name: "How long do refunds take?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Refunds are processed within 3-5 working days after the returned item is received and inspected.",
                },
              },
              {
                "@type": "Question",
                name: "What if I receive a damaged product?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "If you receive a damaged product or one that does not match the advertised condition, contact us immediately and we will provide a full refund including any shipping charges.",
                },
              },
            ],
          }),
        }}
      />
    </>
  );
}
