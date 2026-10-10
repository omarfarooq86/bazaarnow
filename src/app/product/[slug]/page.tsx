import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts, getAllProductSlugs, getCategoryBySlug } from "@/lib/products";
import { shortProductName } from "@/lib/utils";
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
  const price = currentPrice.toLocaleString("en-PK");
  const shortName = shortProductName(product.name);

  return {
    // Mirrors how these products actually get searched: "<product> price in pakistan".
    title: `${shortName} Price in Pakistan — Rs. ${price}`,
    description: `Buy ${shortName} online in Pakistan for Rs. ${price}. Free delivery in 2-4 working days, cash on delivery available, 7-day returns. Shop at BazaarNow.`,
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
