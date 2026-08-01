"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  ArrowLeft,
  MessageCircle,
  Check,
  Banknote,
  Smartphone,
  Building2,
  Percent,
  Truck,
  ShieldCheck,
  ChevronRight,
  MapPin,
  Phone,
  User,
  FileText,
  Copy,
} from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/lib/cart";
import { formatPrice, getEffectivePrice, calculateAdvanceDiscount } from "@/lib/utils";
import { getSiteConfig } from "@/lib/config";
import { openWhatsApp, saveOrderToSheet } from "@/lib/whatsapp";
import type { PaymentType, CustomerInfo } from "@/types";

export default function CheckoutClient() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const subtotal = getSubtotal();
  const config = getSiteConfig();

  const [paymentType, setPaymentType] = useState<PaymentType>("cod");
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CustomerInfo, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const advanceDiscount = calculateAdvanceDiscount(subtotal);
  const total = paymentType === "advance" ? subtotal - advanceDiscount : subtotal;

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CustomerInfo, string>> = {};
    if (!customer.name.trim()) errors.name = "Name is required";
    if (!customer.phone.trim()) {
      errors.phone = "Phone is required";
    } else if (!/^03\d{9}$/.test(customer.phone.replace(/[\s-]/g, ""))) {
      errors.phone = "Enter a valid Pakistani phone number (03XX XXXXXXX)";
    }
    if (!customer.address.trim()) errors.address = "Address is required";
    if (!customer.city.trim()) errors.city = "City is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      openWhatsApp(items, customer, paymentType);
      saveOrderToSheet(items, customer, paymentType);
      clearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  const paymentMethods = [
    { id: "cod" as PaymentType, name: "Cash on Delivery", icon: Banknote, desc: "Pay when you receive your order" },
    { id: "advance" as PaymentType, name: "Advance Payment", icon: Smartphone, desc: "JazzCash, EasyPaisa & Bank Transfer — 5% OFF!" },
  ];

  return (
    <div className="container-custom py-8 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-8">
        <div>
          <h1 className="heading-2 text-dark">Checkout</h1>
          <p className="text-charcoal-400 text-sm mt-1">
            Complete your order via WhatsApp
          </p>
        </div>
        <Link
          href="/cart"
          className="text-sm font-medium text-brand-500 hover:text-brand-600 flex items-center gap-1 flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-8 max-w-full">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          {/* Customer Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white border border-charcoal-100 p-4 sm:p-6"
          >
            <h3 className="font-heading font-semibold text-lg text-dark mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-500" />
              Customer Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 overflow-x-hidden">
              <div>
                <label className="block text-xs font-semibold text-charcoal-500 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  placeholder="Ahmed Khan"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                    formErrors.name
                      ? "border-crimson-300 bg-crimson-50/30"
                      : "border-charcoal-200 focus:border-brand-400"
                  }`}
                />
                {formErrors.name && (
                  <p className="text-xs text-crimson-500 mt-1">{formErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal-500 mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  placeholder="03XX XXXXXXX"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                    formErrors.phone
                      ? "border-crimson-300 bg-crimson-50/30"
                      : "border-charcoal-200 focus:border-brand-400"
                  }`}
                />
                {formErrors.phone && (
                  <p className="text-xs text-crimson-500 mt-1">{formErrors.phone}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-charcoal-500 mb-1.5">
                  Delivery Address *
                </label>
                <input
                  type="text"
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  placeholder="House #, Street, Area"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                    formErrors.address
                      ? "border-crimson-300 bg-crimson-50/30"
                      : "border-charcoal-200 focus:border-brand-400"
                  }`}
                />
                {formErrors.address && (
                  <p className="text-xs text-crimson-500 mt-1">{formErrors.address}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal-500 mb-1.5">
                  City *
                </label>
                <select
                  value={customer.city}
                  onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors bg-white ${
                    formErrors.city
                      ? "border-crimson-300 bg-crimson-50/30"
                      : "border-charcoal-200 focus:border-brand-400"
                  }`}
                >
                  <option value="">Select City</option>
                  {config.deliveryCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {formErrors.city && (
                  <p className="text-xs text-crimson-500 mt-1">{formErrors.city}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal-500 mb-1.5">
                  Additional Notes (Optional)
                </label>
                <input
                  type="text"
                  value={customer.notes}
                  onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                  placeholder="Any special instructions..."
                  className="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 text-sm outline-none focus:border-brand-400 transition-colors"
                />
              </div>
            </div>
          </motion.div>

          {/* Payment Method */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white border border-charcoal-100 p-4 sm:p-6"
          >
            <h3 className="font-heading font-semibold text-lg text-dark mb-4 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-brand-500" />
              Payment Method
            </h3>
            <div className="space-y-3 overflow-x-hidden">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentType(method.id)}
                  className={`w-full flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${
                    paymentType === method.id
                      ? "border-brand-500 bg-brand-50/50 shadow-sm"
                      : "border-charcoal-100 hover:border-charcoal-200"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      paymentType === method.id
                        ? "bg-brand-500 text-white"
                        : "bg-charcoal-100 text-charcoal-500"
                    }`}
                  >
                    <method.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-dark">{method.name}</p>
                    <p className="text-xs text-charcoal-400">{method.desc}</p>
                  </div>
                  {paymentType === method.id && (
                    <Check className="w-5 h-5 text-brand-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Bank details for advance payment */}
            <AnimatePresence>
              {paymentType === "advance" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="p-4 rounded-xl bg-gold-50 border border-gold-200">
                    <p className="text-xs font-semibold text-charcoal-600 mb-3">
                      Transfer to any of these accounts:
                    </p>
                    {config.bankDetails.map((bank) => (
                      <div
                        key={bank.bank}
                        className="flex items-start justify-between gap-2 py-2 border-b border-gold-100 last:border-0"
                      >
                        <div>
                          <p className="text-xs font-semibold text-dark">{bank.bank}</p>
                          <p className="text-xs text-charcoal-500">{bank.accountTitle}</p>
                          <p className="text-xs font-mono text-charcoal-600 mt-0.5 break-all">
                            {bank.accountNumber}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(bank.accountNumber);
                          }}
                          className="p-1.5 rounded-lg hover:bg-gold-100 text-charcoal-400 transition-colors"
                          aria-label={`Copy ${bank.bank} account number`}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <p className="text-xs text-charcoal-500 mt-3">
                      Please share the payment screenshot on WhatsApp after placing your order.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Order Summary sidebar */}
        <div className="lg:col-span-1 min-w-0">
          <div className="sticky top-28">
            <div className="rounded-2xl bg-white border border-charcoal-100 p-4 sm:p-6">
              <h3 className="font-heading font-semibold text-lg text-dark mb-4">
                Your Order
              </h3>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => {
                  const { current } = getEffectivePrice(item.product.price, item.product.salePrice);
                  return (
                    <div key={item.product.slug} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-charcoal-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <ShoppingBag className="w-5 h-5 text-charcoal-300 absolute" />
                        {item.product.images?.[0] && (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            width={100}
                            height={100}
                            className="w-full h-full object-cover relative z-10"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 max-w-[60%]">
                        <p className="text-xs font-medium text-dark truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-charcoal-400">
                          Qty: {item.quantity} × {formatPrice(current)}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-dark">
                        {formatPrice(current * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-charcoal-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-charcoal-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-charcoal-600">
                  <span>Delivery</span>
                  <span className="text-emerald-600 font-medium">Free</span>
                </div>
                {paymentType === "advance" && (
                  <div className="flex justify-between text-emerald-600">
                    <span className="flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5" />
                      Advance Discount (5%)
                      </span>
                    <span>-{formatPrice(advanceDiscount)}</span>
                  </div>
                )}
                <div className="border-t border-charcoal-100 pt-2 flex justify-between font-bold text-dark text-base break-words">
                  <span>Total</span>
                  <span className="text-brand-600">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Place Order */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full mt-5 py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25"
              >
                <MessageCircle className="w-5 h-5" />
                {isSubmitting ? "Opening WhatsApp..." : "Order via WhatsApp"}
              </motion.button>

              {/* Social sharing */}
              <div className="mt-4 p-3 rounded-xl bg-brand-50 border border-brand-100 text-center">
                <p className="text-[0.7rem] font-semibold text-brand-700 mb-1">
                  Share your order & get a discount
                </p>
                <p className="text-[0.6rem] text-brand-600">
                  Tag @bazaarnowpk on Instagram or Facebook with your unboxing. We'll DM you a discount code for your next order.
                </p>
              </div>

              {/* Inventory notice */}
              <p className="mt-3 text-[0.65rem] text-charcoal-400 text-center leading-relaxed px-2">
                We do not hold inventory. Once you place your order, we will arrange
                the product through our partner and deliver it to you. If you receive
                a damaged product or it does not match the advertised condition, we
                will refund your full amount.
              </p>

              {/* Trust signals */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-xs text-charcoal-400">
                  <Truck className="w-3.5 h-3.5 text-emerald-500" />
                  Free delivery across Pakistan
                </div>
                <div className="flex items-center gap-2 text-xs text-charcoal-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Your info is safe & secure
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
