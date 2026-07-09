import Link from "next/link";
import { Home, Search, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-custom py-20">
      <div className="max-w-md mx-auto text-center">
        {/* 404 Illustration */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-brand-50" />
          <div className="absolute inset-8 rounded-full bg-brand-100 flex items-center justify-center">
            <span className="text-7xl font-heading font-black text-brand-500">
              404
            </span>
          </div>
        </div>

        <h1 className="heading-2 text-dark mb-3">Page Not Found</h1>
        <p className="text-charcoal-500 mb-8 leading-relaxed">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been
          moved. Let&apos;s get you back on track.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="/search"
            className="btn-outline inline-flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Search Products
          </Link>
        </div>
      </div>
    </div>
  );
}
