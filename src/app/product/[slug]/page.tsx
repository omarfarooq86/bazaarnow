import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts, getAllProductSlugs, getCategoryBySlug } from "@/lib/products";
import ProductDetailClient from "./ProductDetailClient";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  const currentPrice = product.salePrice ?? product.price;
  const category = getCategoryBySlug(product.category);

  return {
    title: `${product.name} — Buy Online in Pakistan at Rs. ${currentPrice.toLocaleString("en-PK")}`,
    description: `${product.name} — ${product.description.slice(0, 150).replace(/[*_#\n]/g, " ")}... Shop now at BazaarNow with free delivery across Pakistan. COD available.`,
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 200).replace(/[*_#\n]/g, " "),
      images: product.images.map((img) => ({
        url: img,
        width: 800,
        height: 800,
        alt: product.name,
      })),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description.slice(0, 200).replace(/[*_#\n]/g, " "),
    },
    other: {
      "product:price:amount": String(currentPrice),
      "product:price:currency": "PKR",
      "product:availability": product.inStock ? "in stock" : "out of stock",
      "product:category": category?.name || product.category,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(slug, product.category);

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
