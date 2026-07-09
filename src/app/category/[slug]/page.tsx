import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/products";
import CategoryClient from "./CategoryClient";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const categories = await import("@/../data/categories.json");
  return (categories.default as { slug: string }[]).map((cat) => ({
    slug: cat.slug,
  }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} — Shop Online in Pakistan`,
    description: category.description,
    openGraph: {
      title: `${category.name} — BazaarNow`,
      description: category.description,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = await getProductsByCategory(slug);

  return (
    <CategoryClient
      slug={slug}
      category={category}
      products={products}
    />
  );
}
