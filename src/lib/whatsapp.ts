import type { CartItem, CustomerInfo, PaymentType } from "@/types";
import { calculateAdvanceDiscount, getEffectivePrice } from "./utils";
import { getSiteConfig } from "./config";

/**
 * Generate a formatted WhatsApp order message
 */
export function generateWhatsAppMessage(
  items: CartItem[],
  customer: CustomerInfo,
  paymentType: PaymentType
): string {
  const config = getSiteConfig();
  const subtotal = items.reduce((total, item) => {
    const { current } = getEffectivePrice(item.product.price, item.product.salePrice);
    return total + current * item.quantity;
  }, 0);

  const isAdvance = paymentType === "advance";
  const discount = isAdvance ? calculateAdvanceDiscount(subtotal) : 0;
  const total = subtotal - discount;

  const lines: string[] = [];

  lines.push(`*🛒 New Order — ${config.name}*`);
  lines.push("");
  lines.push("---");
  lines.push("*Order Details:*");
  lines.push("");

  items.forEach((item, index) => {
    const { current } = getEffectivePrice(item.product.price, item.product.salePrice);
    const itemTotal = current * item.quantity;
    lines.push(
      `${index + 1}. ${item.product.name} x${item.quantity} — Rs. ${itemTotal.toLocaleString("en-PK")}`
    );
  });

  lines.push("");
  lines.push("---");
  lines.push(`*Subtotal:* Rs. ${subtotal.toLocaleString("en-PK")}`);

  if (isAdvance) {
    lines.push(`*Payment:* Advance Payment`);
    lines.push(`*Discount (5%):* -Rs. ${discount.toLocaleString("en-PK")}`);
    lines.push(`*Total After Discount:* Rs. ${total.toLocaleString("en-PK")}`);
  } else {
    lines.push(`*Payment:* Cash on Delivery`);
    lines.push(`*Total:* Rs. ${total.toLocaleString("en-PK")}`);
  }

  lines.push("");
  lines.push("---");
  lines.push("*Customer Information:*");
  lines.push(`Name: ${customer.name}`);
  lines.push(`Phone: ${customer.phone}`);
  lines.push(`Address: ${customer.address}`);
  lines.push(`City: ${customer.city}`);

  if (customer.notes) {
    lines.push(`Notes: ${customer.notes}`);
  }

  if (isAdvance) {
    lines.push("");
    lines.push("---");
    lines.push("*Bank Transfer Details:*");
    config.bankDetails.forEach((bank) => {
      lines.push(`🏦 ${bank.bank}`);
      lines.push(`   Title: ${bank.accountTitle}`);
      lines.push(`   Account: ${bank.accountNumber}`);
      if (bank.iban) lines.push(`   IBAN: ${bank.iban}`);
    });
    lines.push("");
    lines.push("_Please share a screenshot of the payment receipt._");
  }

  return encodeURIComponent(lines.join("\n"));
}

/**
 * Open WhatsApp with the order message
 */
export function openWhatsApp(
  items: CartItem[],
  customer: CustomerInfo,
  paymentType: PaymentType
): void {
  const config = getSiteConfig();
  const message = generateWhatsAppMessage(items, customer, paymentType);
  const url = `https://wa.me/${config.whatsapp}?text=${message}`;
  window.open(url, "_blank");
}
