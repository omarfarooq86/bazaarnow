import type { Metadata } from "next";
import { ShieldCheck, Lock, Eye, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "BazaarNow Privacy Policy — how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-dark py-16">
        <div className="container-custom text-center">
          <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
            Legal
          </span>
          <h1 className="heading-1 text-white mt-2 mb-4">Privacy Policy</h1>
          <p className="text-charcoal-300 text-base max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect,
            use, and safeguard your personal information.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-custom max-w-3xl">
          <div className="space-y-8">
            <div className="rounded-2xl bg-white border border-charcoal-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-brand-500" />
                </div>
                <h2 className="heading-3 text-dark">Information We Collect</h2>
              </div>
              <div className="text-sm text-charcoal-600 space-y-2">
                <p>
                  When you place an order or contact us, we may collect the following
                  information:
                </p>
                <ul className="space-y-1.5 ml-4">
                  <li className="flex gap-2">
                    <span className="text-brand-500">•</span>
                    Your name, phone number, and delivery address
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brand-500">•</span>
                    Order details including products purchased and payment method
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brand-500">•</span>
                    Communication history via WhatsApp, email, or phone
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-charcoal-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-brand-500" />
                </div>
                <h2 className="heading-3 text-dark">How We Use Your Information</h2>
              </div>
              <div className="text-sm text-charcoal-600 space-y-2">
                <p>We use the information we collect to:</p>
                <ul className="space-y-1.5 ml-4">
                  <li className="flex gap-2">
                    <span className="text-brand-500">•</span>
                    Process and deliver your orders
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brand-500">•</span>
                    Communicate with you about your order status
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brand-500">•</span>
                    Respond to your inquiries and provide customer support
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brand-500">•</span>
                    Improve our products and services
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brand-500">•</span>
                    Comply with legal obligations
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-charcoal-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-brand-500" />
                </div>
                <h2 className="heading-3 text-dark">Data Protection</h2>
              </div>
              <div className="text-sm text-charcoal-600 space-y-2">
                <p>
                  We take the security of your personal information seriously:
                </p>
                <ul className="space-y-1.5 ml-4">
                  <li className="flex gap-2">
                    <span className="text-brand-500">•</span>
                    Your data is only shared with our delivery partners as necessary to fulfill your order.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brand-500">•</span>
                    We never sell, rent, or trade your personal information to third parties for marketing purposes.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brand-500">•</span>
                    Payment information (bank accounts, mobile wallet numbers) is only used for processing your order and is not stored beyond what is necessary.
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-charcoal-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-brand-500" />
                </div>
                <h2 className="heading-3 text-dark">Your Rights</h2>
              </div>
              <div className="text-sm text-charcoal-600 space-y-2">
                <p>You have the right to:</p>
                <ul className="space-y-1.5 ml-4">
                  <li className="flex gap-2">
                    <span className="text-brand-500">•</span>
                    Request a copy of the personal data we hold about you
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brand-500">•</span>
                    Ask us to correct any inaccurate information
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brand-500">•</span>
                    Request deletion of your personal data after your order is complete
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-charcoal-100 p-6">
              <h2 className="heading-3 text-dark mb-4">Contact Us</h2>
              <p className="text-sm text-charcoal-600 mb-3">
                If you have any questions about this privacy policy or how your data
                is handled, please contact us:
              </p>
              <div className="text-sm text-charcoal-600 space-y-1">
                <p>
                  <strong>WhatsApp:</strong> +92 310 1418307
                </p>
                <p>
                  <strong>Email:</strong> omee00@gmail.com
                </p>
              </div>
            </div>

            <p className="text-xs text-charcoal-400 text-center">
              Last updated: July 2026
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
