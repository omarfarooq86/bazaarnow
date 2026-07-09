import Link from "next/link";

interface CategoryFilterProps {
  currentCategory: string;
}

// This is a server component that can be used in category pages
export default function CategoryFilter({ currentCategory }: CategoryFilterProps) {
  return null; // Reserved for future filter implementation (price range, brand, etc.)
}
