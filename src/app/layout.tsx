import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";

export const metadata: Metadata = {
  title: {
    default: "BazaarNow — Pakistan Ka Apna Bazaar",
    template: "%s | BazaarNow",
  },
  description:
    "Pakistan's most trusted online marketplace — premium products at unbeatable prices. Free delivery nationwide. COD, JazzCash & EasyPaisa accepted.",
  keywords: [
    "online shopping pakistan",
    "ecommerce pakistan",
    "cash on delivery",
    "bazaarnow",
    "pakistani marketplace",
    "buy online pakistan",
    "jazzcash payment",
    "easypaisa payment",
  ],
  authors: [{ name: "BazaarNow" }],
  metadataBase: new URL("https://bazaarnow.pk"),
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: "BazaarNow",
    title: "BazaarNow — Pakistan Ka Apna Bazaar",
    description:
      "Premium products at unbeatable prices. Free delivery across Pakistan.",
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "BazaarNow",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BazaarNow — Pakistan Ka Apna Bazaar",
    description:
      "Premium products at unbeatable prices. Free delivery across Pakistan.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://hhcnewapp.blr1.cdn.digitaloceanspaces.com" />
        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Organization schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "BazaarNow",
              url: "https://bazaarnow.pk",
              logo: "https://bazaarnow.pk/images/logo.png",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+92-300-1234567",
                contactType: "customer service",
                availableLanguage: ["English", "Urdu"],
              },
              sameAs: [
                "https://facebook.com/bazaarnowpk",
                "https://instagram.com/bazaarnowpk",
                "https://tiktok.com/@bazaarnowpk",
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-cream-50 text-dark font-body">
        <Navbar />
        <main className="flex-1 pt-24">{children}</main>
        <Footer />
        <MobileNav />
        <WhatsAppFloat />
        <Analytics />
      </body>
    </html>
  );
}
