import { Suspense } from "react";
import type { Metadata } from "next";
import SearchClient from "./SearchClient";

export const metadata: Metadata = {
  title: "Search Products",
  description: "Search across all products at BazaarNow.",
  // Search result pages are infinite thin permutations. Keep them crawlable
  // (follow) so link equity still flows, but out of the index.
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container-custom py-20 text-center">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
