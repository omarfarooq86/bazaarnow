"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Eye, Heart, Star } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice, getEffectivePrice, calculateSavings } from "@/lib/utils";
import { useCartStore } from "@/lib/cart";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const { current, original, hasDiscount } = getEffectivePrice(
    product.price,
    product.salePrice
  );
  const savings = hasDiscount
    ? calculateSavings(original, current)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group relative"
    >
      <Link
        href={`/product/${product.slug}`}
        className="block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square rounded-2xl bg-charcoal-50 overflow-hidden mb-3">
          {/* Product image placeholder with gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-charcoal-100 to-charcoal-200 flex items-center justify-center">
            {product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <ShoppingBag className="w-12 h-12 text-charcoal-300" />
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {hasDiscount && (
              <span className="badge-sale">-{savings}% OFF</span>
            )}
            {product.stockCount && product.stockCount <= 10 && (
              <span className="badge-new">Only {product.stockCount} left</span>
            )}
          </div>

          {/* Hover overlay actions */}
          <div
            className={`absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-end justify-center pb-4 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 backdrop-blur-sm ${
                isAdded
                  ? "bg-emerald-500 text-white"
                  : "bg-white text-dark shadow-lg hover:bg-brand-500 hover:text-white"
              }`}
            >
              {isAdded ? "✓ Added!" : "Add to Cart"}
            </motion.button>
          </div>

          {/* Wishlist button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              isWishlisted
                ? "bg-crimson-500 text-white"
                : "bg-white/80 backdrop-blur-sm text-charcoal-400 hover:text-crimson-500"
            }`}
            aria-label="Add to wishlist"
          >
            <Heart
              className="w-4 h-4"
              fill={isWishlisted ? "currentColor" : "none"}
            />
          </button>

          {/* Quick view */}
          <div
            className={`absolute top-12 right-2.5 transition-all duration-200 ${
              isHovered
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-2"
            }`}
          >
            <Link
              href={`/product/${product.slug}`}
              className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-charcoal-400 hover:text-brand-500"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Product info */}
        <div className="px-1">
          <p className="text-xs text-charcoal-400 font-medium uppercase tracking-wider mb-1">
            {product.category.replace("-", " & ")}
          </p>
          <h3 className="text-sm font-semibold text-dark leading-tight mb-1.5 line-clamp-2 group-hover:text-brand-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < 4 ? "text-gold-400 fill-gold-400" : "text-charcoal-200"
                }`}
              />
            ))}
            <span className="text-xs text-charcoal-400 ml-1">(4.0)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-brand-600">
              {formatPrice(current)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-charcoal-400 price-strikethrough">
                {formatPrice(original)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
