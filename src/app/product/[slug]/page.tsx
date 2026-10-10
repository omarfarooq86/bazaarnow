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

/**
 * Product names are long supplier strings: a readable head, then a spec dump
 * after the first pipe or dash. The old title took a raw 42-char slice, which
 * cut mid-word ("Barkat Buffalo Desi Ghee – Premium Traditi...") and pushed the
 * title past 100 characters — well beyond the ~60 a SERP shows.
 *
 * Keep the head, capped at a word boundary, so the query phrase and the price
 * still land inside the visible width.
 */
const NAME_SEPARATOR = /\s*[|–—]\s*|\s+-\s+/;
const TRAILING_PUNCT = /[\s,;:.\-–—]+$/;
function shortProductName(name: string, max = 30): string {
  const head = (name.split(NAME_SEPARATOR)[0] || "").trim();
  if (!head) return name.trim().replace(TRAILING_PUNCT, "");
  if (head.length <= max) return head.replace(TRAILING_PUNCT, "");
  const cut = head.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  // Words are cut at a space, then any punctuation the cut exposed is trimmed,
  // so we never ship "1 Pc Car Scratch Repair Pen," with a dangling comma.
  return (lastSpace > 10 ? cut.slice(0, lastSpace) : cut).replace(TRAILING_PUNCT, "");
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
