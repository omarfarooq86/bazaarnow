import Link from "next/link";
import {
  Banknote,
  Smartphone,
  Building2,
  Truck,
  ShieldCheck,
  HeadphonesIcon,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { getSiteConfig, getCategories } from "@/lib/products";

export default function Footer() {
  const config = getSiteConfig();
  const categories = getCategories();

  const paymentIcons: Record<string, React.ReactNode> = {
    Banknote: <Banknote className="w-4 h-4" />,
    Smartphone: <Smartphone className="w-4 h-4" />,
    Building2: <Building2 className="w-4 h-4" />,
  };

  return (
    <footer className="bg-dark text-white pb-20 lg:pb-0">
      {/* Trust badges strip */}
      <div className="border-b border-white/10">
        <div className="container-custom py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, label: "Free Delivery", sub: "Across Pakistan" },
              { icon: ShieldCheck, label: "Secure Payment", sub: "100% Protected" },
              { icon: Banknote, label: "Cash on Delivery", sub: "Pay When You Receive" },
              { icon: HeadphonesIcon, label: "24/7 Support", sub: "WhatsApp & Phone" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 flex-shrink-0">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-charcoal-300">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                B
              </div>
              <span className="font-heading font-bold text-xl text-white">
                Bazaar<span className="text-brand-400">Now</span>
              </span>
            </Link>
            <p className="text-charcoal-300 text-sm leading-relaxed mb-4">
              {config.tagline}. Premium products, unbeatable prices, and free delivery across Pakistan.
            </p>
            <div className="space-y-2 text-sm text-charcoal-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>{config.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <a href={`tel:${config.phone}`} className="hover:text-brand-400 transition-colors">
                  {config.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <a href={`mailto:${config.email}`} className="hover:text-brand-400 transition-colors">
                  {config.email}
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-white text-base mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact Us" },
                { href: "/offers", label: "Special Offers" },
                { href: "/cart", label: "My Cart" },
                { href: "/about", label: "Return Policy" },
                { href: "/about", label: "Privacy Policy" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-charcoal-300 hover:text-brand-400 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-heading font-semibold text-white text-base mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-charcoal-300 hover:text-brand-400 text-sm transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h4 className="font-heading font-semibold text-white text-base mb-4">
              Payment Methods
            </h4>
            <div className="space-y-3">
              {config.paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400 flex-shrink-0">
                    {paymentIcons[method.icon] || <Banknote className="w-4 h-4" />}
                  </div>
                  <span className="text-sm text-charcoal-200">{method.name}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-brand-500/10 border border-brand-500/20">
              <p className="text-xs text-brand-300">
                <span className="font-semibold text-brand-400">5% Discount</span> on
                all advance payments via JazzCash, EasyPaisa & Bank Transfer!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-charcoal-400">
            &copy; {new Date().getFullYear()} {config.name}. All rights reserved.
          </p>
          <p className="text-xs text-charcoal-400">
            Made with ❤️ in Pakistan
          </p>
        </div>
      </div>
    </footer>
  );
}
