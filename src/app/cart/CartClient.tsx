"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Percent,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { useCartStore } from "@/lib/cart";
import { formatPrice, getEffectivePrice } from "@/lib/utils";

export default function CartClient() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();

  if (items.length === 0) {
    return (
      <div className="container-custom py-20">
        <div className="max-w-md mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-24 h-24 rounded-full bg-charcoal-100 flex items-center justify-center mx-auto mb-6"
          >
            <ShoppingBag className="w-10 h-10 text-charcoal-300" />
          </motion.div>
          <h1 className="heading-2 text-dark mb-3">Your Cart is Empty</h1>
          <p className="text-charcoal-500 mb-8">
            Looks like you haven&apos;t added anything to your cart yet. Explore our
            products and find something you love!
          </p>
          <Link href="/" className="btn-primary inline-flex">
            <ArrowLeft className="w-4 h-4" />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="heading-2 text-dark">Shopping Cart</h1>
          <p className="text-charcoal-400 text-sm mt-1">
            {items.length} item{items.length !== 1 ? "s" : ""} in your cart
          </p>
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-brand-500 hover:text-brand-600 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item, index) => {
              const { current, original, hasDiscount } = getEffectivePrice(
                item.product.price,
                item.product.salePrice
              );
              const itemTotal = current * item.quantity;

              return (
                <motion.div
                  key={item.product.slug}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-4 p-4 rounded-2xl bg-white border border-charcoal-100 hover:border-charcoal-200 transition-colors"
                >
                  {/* Product image */}
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="w-24 h-24 rounded-xl bg-charcoal-50 flex items-center justify-center flex-shrink-0 overflow-hidden"
                  >
                    <ShoppingBag className="w-8 h-8 text-charcoal-300 absolute" />
                    {item.product.images?.[0] && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover relative z-10"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="text-sm font-semibold text-dark hover:text-brand-600 transition-colors line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-charcoal-400 mt-0.5 capitalize">
                      {item.product.category.replace("-", " & ")}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        {/* Quantity */}
                        <div className="flex items-center gap-0 border border-charcoal-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.slug,
                                item.quantity - 1
                              )
                            }
                            className="p-1.5 hover:bg-charcoal-50 transition-colors text-charcoal-500"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.slug,
                                item.quantity + 1
                              )
                            }
                            className="p-1.5 hover:bg-charcoal-50 transition-colors text-charcoal-500"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.product.slug)}
                          className="p-1.5 rounded-lg hover:bg-crimson-50 text-charcoal-400 hover:text-crimson-500 transition-colors"
                          aria-label={`Remove ${item.product.name} from cart`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-brand-600">
                          {formatPrice(itemTotal)}
                        </span>
                        {hasDiscount && (
                          <span className="block text-xs text-charcoal-400 price-strikethrough">
                            {formatPrice(original * item.quantity)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-28">
            <div className="rounded-2xl bg-white border border-charcoal-100 p-6">
              <h3 className="font-heading font-semibold text-lg text-dark mb-4">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-charcoal-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-charcoal-600">
                  <span>Delivery</span>
                  <span className="text-emerald-600 font-medium">Free</span>
                </div>
                <div className="border-t border-charcoal-100 pt-3 flex justify-between font-semibold text-dark">
                  <span>Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </div>

              {/* Advance payment hint */}
              <div className="mt-4 p-3 rounded-xl bg-gold-50 border border-gold-200 flex items-center gap-2">
                <Percent className="w-4 h-4 text-gold-500 flex-shrink-0" />
                <span className="text-xs text-charcoal-600">
                  Pay in advance & save{" "}
                  <strong>{formatPrice(Math.round(subtotal * 0.05))}</strong>{" "}
                  (5% off)!
                </span>
              </div>

              <Link
                href="/checkout"
                className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Trust signals */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-charcoal-400">
                  <Truck className="w-3.5 h-3.5 text-emerald-500" />
                  Free delivery across Pakistan
                </div>
                <div className="flex items-center gap-2 text-xs text-charcoal-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Secure checkout
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
