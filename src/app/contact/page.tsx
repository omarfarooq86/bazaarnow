import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/products";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with BazaarNow — Pakistan's trusted online marketplace.",
};

export default function ContactPage() {
  const config = getSiteConfig();

  const contactMethods = [
    {
      icon: Phone,
      label: "Phone",
      value: config.phone,
      href: `tel:${config.phone}`,
      color: "text-brand-500",
      bg: "bg-brand-50",
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: `+92 ${config.whatsapp.slice(3)}`,
      href: `https://wa.me/${config.whatsapp}`,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      icon: Mail,
      label: "Email",
      value: config.email,
      href: `mailto:${config.email}`,
      color: "text-gold-500",
      bg: "bg-gold-50",
    },
    {
      icon: MapPin,
      label: "Address",
      value: config.address,
      href: null,
      color: "text-crimson-500",
      bg: "bg-crimson-50",
    },
  ];

  return (
    <>
      <section className="bg-dark py-16">
        <div className="container-custom text-center">
          <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
            Get in Touch
          </span>
          <h1 className="heading-1 text-white mt-2 mb-4">Contact Us</h1>
          <p className="text-charcoal-300 text-base max-w-2xl mx-auto">
            Have a question? We&apos;re here to help. Reach out via any of the
            channels below.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-custom max-w-3xl">
          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            {contactMethods.map((method) => (
              <div
                key={method.label}
                className="p-6 rounded-2xl bg-white border border-charcoal-100 hover:border-charcoal-200 transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${method.bg} flex items-center justify-center mb-4`}
                >
                  <method.icon className={`w-6 h-6 ${method.color}`} />
                </div>
                <h3 className="font-heading font-semibold text-dark mb-1">
                  {method.label}
                </h3>
                {method.href ? (
                  <a
                    href={method.href}
                    className="text-sm text-charcoal-500 hover:text-brand-500 transition-colors"
                    {...(method.label === "WhatsApp" || method.label === "Phone"
                      ? {}
                      : {})}
                    {...(method.label === "WhatsApp"
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {method.value}
                  </a>
                ) : (
                  <p className="text-sm text-charcoal-500">{method.value}</p>
                )}
              </div>
            ))}
          </div>

          {/* Delivery cities */}
          <div className="rounded-2xl bg-white border border-charcoal-100 p-8 mb-8">
            <h2 className="heading-3 text-dark mb-4">We Deliver To</h2>
            <div className="flex flex-wrap gap-2">
              {config.deliveryCities.map((city) => (
                <span
                  key={city}
                  className="px-3 py-1.5 rounded-lg bg-charcoal-50 text-sm text-charcoal-600 font-medium"
                >
                  {city}
                </span>
              ))}
            </div>
            <p className="text-sm text-charcoal-400 mt-4">
              Delivery time: {config.deliveryTime} | Free delivery on all orders
            </p>
          </div>

          {/* Business hours */}
          <div className="rounded-2xl bg-white border border-charcoal-100 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-brand-500" />
              </div>
              <h2 className="heading-3 text-dark">Business Hours</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between py-2 border-b border-charcoal-50">
                <span className="text-charcoal-500">Monday - Friday</span>
                <span className="font-semibold text-dark">9:00 AM - 8:00 PM</span>
              </div>
              <div className="flex justify-between py-2 border-b border-charcoal-50">
                <span className="text-charcoal-500">Saturday</span>
                <span className="font-semibold text-dark">10:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between py-2 border-b border-charcoal-50">
                <span className="text-charcoal-500">Sunday</span>
                <span className="font-semibold text-charcoal-400">Closed</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
