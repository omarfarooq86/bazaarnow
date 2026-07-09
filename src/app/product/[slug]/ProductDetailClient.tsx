"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  Share2,
  Minus,
  Plus,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Banknote,
  Check,
  ChevronLeft,
  ChevronRight,
  Star,
  Smartphone,
  Building2,
  Play,
  X,
} from "lucide-react";
import type { Product } from "@/types";
import {
  formatPrice,
  getEffectivePrice,
  calculateSavings,
} from "@/lib/utils";
import { useCartStore } from "@/lib/cart";
import { getSiteConfig } from "@/lib/config";
import ProductCard from "@/components/product/ProductCard";
import { openWhatsApp } from "@/lib/whatsapp";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({
  product,
  relatedProducts,
}: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const detailVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (showVideo && detailVideoRef.current) {
      detailVideoRef.current.load();
      detailVideoRef.current.play().catch(() => {});
    }
  }, [showVideo]);

  const addItem = useCartStore((s) => s.addItem);
  const config = getSiteConfig();

  const { current, original, hasDiscount } = getEffectivePrice(
    product.price,
    product.salePrice
  );
  const savings = hasDiscount ? calculateSavings(original, current) : 0;
  const advanceDiscount = Math.round(current * 0.05);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    // Navigate to cart — handled by the link wrapping
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      `*${product.name}*\n\n💰 Price: Rs. ${current.toLocaleString("en-PK")}${hasDiscount ? ` (Was Rs. ${original.toLocaleString("en-PK")})` : ""}\n\n📦 ${product.deliveryInfo}\n\n🛒 Order now: https://bazaarnow.pk/product/${product.slug}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="container-custom py-4">
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="text-charcoal-400 hover:text-brand-500 transition-colors"
          >
            Home
          </Link>
          <span className="text-charcoal-300">/</span>
          <Link
            href={`/category/${product.category}`}
            className="text-charcoal-400 hover:text-brand-500 transition-colors capitalize"
          >
            {product.category.replace("-", " & ")}
          </Link>
          <span className="text-charcoal-300">/</span>
          <span className="text-charcoal-600 font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>
      </div>

      <div className="container-custom py-2 pb-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square rounded-2xl bg-charcoal-50 overflow-hidden mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-charcoal-100 to-charcoal-200 flex items-center justify-center">
                {product.images[selectedImage] ? (
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ShoppingBag className="w-20 h-20 text-charcoal-300" />
                )}
              </div>

              {/* Navigation arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage(
                        (prev) =>
                          (prev - 1 + product.images.length) %
                          product.images.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-charcoal-600 hover:text-brand-500 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage(
                        (prev) => (prev + 1) % product.images.length
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-charcoal-600 hover:text-brand-500 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {hasDiscount && (
                  <span className="badge-sale">-{savings}% OFF</span>
                )}
                {!product.inStock && (
                  <span className="badge-new bg-charcoal-700">Out of Stock</span>
                )}
              </div>

              {/* Wishlist & Share */}
              <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isWishlisted
                      ? "bg-crimson-500 text-white"
                      : "bg-white/90 shadow-md text-charcoal-400 hover:text-crimson-500"
                  }`}
                >
                  <Heart
                    className="w-4 h-4"
                    fill={isWishlisted ? "currentColor" : "none"}
                  />
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  className="w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-charcoal-400 hover:text-emerald-500 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Video play button */}
              {product.videoUrl && (
                <button
                  onClick={() => setShowVideo(true)}
                  className="absolute bottom-4 left-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-dark/70 backdrop-blur-sm text-white text-sm font-medium hover:bg-dark/90 transition-colors"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Watch Video
                </button>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden border-2 transition-all ${
                      i === selectedImage
                        ? "border-brand-500 shadow-md"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className="w-full h-full bg-charcoal-100 flex items-center justify-center">
                      <img
                        src={img}
                        alt={`${product.name} - View ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Category & name */}
            <p className="text-sm text-brand-500 font-semibold uppercase tracking-wider mb-2">
              {product.category.replace("-", " & ")}
            </p>
            <h1 className="heading-2 text-dark mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < 4
                        ? "text-gold-400 fill-gold-400"
                        : "text-charcoal-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-charcoal-400">4.0 (24 reviews)</span>
              {product.inStock && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <Check className="w-3 h-3" /> In Stock
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-brand-600">
                {formatPrice(current)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-charcoal-400 price-strikethrough">
                    {formatPrice(original)}
                  </span>
                  <span className="badge-sale">Save {formatPrice(original - current)}</span>
                </>
              )}
            </div>

            {/* Advance payment discount hint */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gold-50 border border-gold-200 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gold-500/20 flex items-center justify-center text-gold-600 flex-shrink-0">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-dark">
                  Pay in Advance & Save {formatPrice(advanceDiscount)}!
                </p>
                <p className="text-xs text-charcoal-500">
                  5% discount on JazzCash, EasyPaisa & Bank Transfer
                </p>
              </div>
            </div>

            {/* Short description */}
            <p className="text-charcoal-500 text-sm leading-relaxed mb-6">
              {product.description.split("\n")[0].replace(/[*_#]/g, "").slice(0, 150)}...
            </p>

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-0 border border-charcoal-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 hover:bg-charcoal-50 transition-colors text-charcoal-500"
                  disabled={!product.inStock}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-semibold text-dark select-none">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(
                      Math.min(
                        quantity + 1,
                        product.stockCount || 99
                      )
                    )
                  }
                  className="p-2.5 hover:bg-charcoal-50 transition-colors text-charcoal-500"
                  disabled={!product.inStock}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  !product.inStock
                    ? "bg-charcoal-200 text-charcoal-400 cursor-not-allowed"
                    : isAdded
                    ? "bg-emerald-500 text-white"
                    : "btn-primary"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </>
                )}
              </motion.button>

              <Link
                href="/cart"
                onClick={handleBuyNow}
                className={`py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  !product.inStock
                    ? "bg-charcoal-200 text-charcoal-400 cursor-not-allowed pointer-events-none"
                    : "bg-dark text-white hover:bg-charcoal-800"
                }`}
              >
                Order Now
              </Link>
            </div>

            {/* Delivery & Payment info */}
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-charcoal-50">
                <Truck className="w-5 h-5 text-brand-500 flex-shrink-0" />
                <span className="text-xs text-charcoal-600">
                  {product.deliveryInfo}
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-charcoal-50">
                <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-xs text-charcoal-600">
                  {product.sku ? `SKU: ${product.sku}` : "1 Year Warranty"}
                </span>
              </div>
            </div>

            {/* Payment methods */}
            <div className="p-4 rounded-2xl bg-white border border-charcoal-100 mb-6">
              <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-3">
                Accepted Payments
              </p>
              <div className="flex flex-wrap gap-2">
                {config.paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-50 text-xs font-medium text-charcoal-600"
                  >
                    {method.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Full Description & Specifications */}
        <div className="mt-12 grid lg:grid-cols-3 gap-10">
          {/* Description */}
          <div className="lg:col-span-2">
            <h2 className="heading-3 text-dark mb-4">Product Description</h2>
            <div className="prose prose-sm max-w-none text-charcoal-600 space-y-3">
              {product.description.split("\n").map((paragraph, i) => {
                // Handle markdown headings
                if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                  return (
                    <h3
                      key={i}
                      className="text-base font-semibold text-dark mt-4 mb-2"
                    >
                      {paragraph.replace(/\*\*/g, "")}
                    </h3>
                  );
                }
                // Handle list items
                if (paragraph.startsWith("- ")) {
                  return (
                    <p key={i} className="text-sm flex gap-2 ml-2">
                      <span className="text-brand-500">•</span>
                      {paragraph.slice(2)}
                    </p>
                  );
                }
                if (paragraph.trim()) {
                  return (
                    <p key={i} className="text-sm leading-relaxed">
                      {paragraph.replace(/\*\*/g, "")}
                    </p>
                  );
                }
                return null;
              })}
            </div>

            {/* Features */}
            {product.features.length > 0 && (
              <div className="mt-8">
                <h3 className="heading-3 text-dark mb-4">Key Features</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {product.features.map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-charcoal-50"
                    >
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm text-charcoal-600">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Specifications sidebar */}
          <div>
            <h2 className="heading-3 text-dark mb-4">Specifications</h2>
            <div className="rounded-2xl bg-white border border-charcoal-100 overflow-hidden">
              <table className="w-full">
                <tbody>
                  {Object.entries(product.specifications).map(
                    ([key, value], i) => (
                      <tr
                        key={key}
                        className={
                          i % 2 === 0 ? "bg-charcoal-50/50" : "bg-white"
                        }
                      >
                        <td className="px-4 py-3 text-xs font-semibold text-charcoal-600 whitespace-nowrap">
                          {key}
                        </td>
                        <td className="px-4 py-3 text-xs text-charcoal-500">
                          {value}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Video Popup Modal */}
        <AnimatePresence>
          {product.videoUrl && showVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowVideo(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25 }}
                className="relative w-full max-w-4xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowVideo(false)}
                  className="absolute -top-12 right-0 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="aspect-video rounded-2xl overflow-hidden bg-dark shadow-2xl">
                  {product.videoUrl.includes("youtube") ||
                  product.videoUrl.includes("youtu.be") ? (
                    <iframe
                      src={product.videoUrl}
                      className="w-full h-full"
                      allowFullScreen
                      title={`${product.name} video`}
                    />
                  ) : (
                    <video
                      ref={detailVideoRef}
                      src={product.videoUrl}
                      className="w-full h-full object-contain"
                      controls
                      playsInline
                      muted
                      loop
                      preload="auto"
                      title={`${product.name} video`}
                    />
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="heading-2 text-dark mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Product Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: product.name,
              description: product.description.replace(/[*_#\n]/g, " ").slice(0, 300),
              sku: product.sku || product.slug,
              image: product.images,
              offers: {
                "@type": "Offer",
                priceCurrency: "PKR",
                price: String(current),
                availability: product.inStock
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
                seller: {
                  "@type": "Organization",
                  name: "BazaarNow",
                },
              },
              brand: {
                "@type": "Brand",
                name: product.specifications["Brand"] || "BazaarNow",
              },
            }),
          }}
        />
        {/* BreadcrumbList */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://bazaarnow.pk",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: product.category.replace("-", " & "),
                  item: `https://bazaarnow.pk/category/${product.category}`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: product.name,
                  item: `https://bazaarnow.pk/product/${product.slug}`,
                },
              ],
            }),
          }}
        />
      </div>
    </>
  );
}
