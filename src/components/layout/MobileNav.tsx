"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3X3, ShoppingBag, MessageCircle } from "lucide-react";
import { useCartStore } from "@/lib/cart";
import { getSiteConfig } from "@/lib/config";

export default function MobileNav() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) =>
    s.items.reduce((t, i) => t + i.quantity, 0)
  );
  const config = getSiteConfig();

  const links = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      href: "/category/electronics",
      label: "Categories",
      icon: Grid3X3,
      isActive: pathname.startsWith("/category"),
    },
    {
      href: "/cart",
      label: "Cart",
      icon: ShoppingBag,
      isActive: pathname === "/cart",
      badge: itemCount > 0 ? itemCount : undefined,
    },
    {
      href: `https://wa.me/${config.whatsapp}`,
      label: "WhatsApp",
      icon: MessageCircle,
      isActive: false,
      isExternal: true,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-charcoal-100 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = link.isActive;

          const content = (
            <div className="relative flex flex-col items-center gap-0.5">
              <div
                className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "text-brand-500"
                    : "text-charcoal-400"
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.badge && (
                  <span className="absolute -top-0.5 -right-1 w-4 h-4 bg-crimson-500 text-white text-[0.55rem] font-bold rounded-full flex items-center justify-center">
                    {link.badge > 9 ? "9+" : link.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[0.65rem] font-semibold ${
                  isActive ? "text-brand-500" : "text-charcoal-400"
                }`}
              >
                {link.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-3 w-6 h-0.5 bg-brand-500 rounded-full" />
              )}
            </div>
          );

          if (link.isExternal) {
            return (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex justify-center"
              >
                {content}
              </a>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex-1 flex justify-center"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
