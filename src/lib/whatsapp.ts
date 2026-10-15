import type { CartItem, CustomerInfo, PaymentType, DeliveryType } from "@/types";
import { calculateAdvanceDiscount, getEffectivePrice } from "./utils";
import { getSiteConfig, getDeliveryFee } from "./config";

/**
 * Generate a formatted WhatsApp order message
 */
export function generateWhatsAppMessage(
  items: CartItem[],
  customer: CustomerInfo,
  paymentType: PaymentType,
  deliveryType: DeliveryType = "normal"
): string {
  const config = getSiteConfig();
  const subtotal = items.reduce((total, item) => {
    const { current } = getEffectivePrice(item.product.price, item.product.salePrice);
    return total + current * item.quantity;
  }, 0);

  const isAdvance = paymentType === "advance";
  const discount = isAdvance ? calculateAdvanceDiscount(subtotal) : 0;
  const deliveryFee = getDeliveryFee(deliveryType);
  const deliveryName =
    config.deliveryOptions.find((o) => o.id === deliveryType)?.name ?? "Normal Delivery";
  const total = subtotal + deliveryFee - discount;

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
    lines.push(
      `   🔗 https://www.bazaarnow.net/product/${item.product.slug}/`
    );
  });

  lines.push("");
  lines.push("---");
  lines.push(`*Subtotal:* Rs. ${subtotal.toLocaleString("en-PK")}`);
  // Normal delivery costs nothing extra — the Rs. 150 courier cost is already inside
  // the product prices. Saying "Free" here would misrepresent that.
  lines.push(
    deliveryFee > 0
      ? `*Delivery:* ${deliveryName} — Rs. ${deliveryFee.toLocaleString("en-PK")}`
      : `*Delivery:* ${deliveryName} (included in price)`
  );
  lines.push(`*Payment:* ${isAdvance ? "Advance Payment" : "Cash on Delivery"}`);

  if (isAdvance) {
    lines.push(`*Discount (5%):* -Rs. ${discount.toLocaleString("en-PK")}`);
  }

  lines.push(`*Total:* Rs. ${total.toLocaleString("en-PK")}`);

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

  lines.push("");
  lines.push("---");
  lines.push("*Help us grow!* Share your order on Instagram or Facebook and tag us @bazaarnowpk. Customers who share get a special discount on their next order.");

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
 * Send order data to Google Sheets via webhook
 *
 * This recomputes the total rather than receiving it, so the delivery fee has to be
 * added here too — otherwise the sheet records a total that omits it and disagrees
 * with the WhatsApp message for the same order.
 */
export async function saveOrderToSheet(
  items: CartItem[],
  customer: CustomerInfo,
  paymentType: PaymentType,
  deliveryType: DeliveryType = "normal"
): Promise<void> {
  const subtotal = items.reduce((total, item) => {
    const { current } = getEffectivePrice(item.product.price, item.product.salePrice);
    return total + current * item.quantity;
  }, 0);

  const isAdvance = paymentType === "advance";
  const discount = isAdvance ? calculateAdvanceDiscount(subtotal) : 0;
  const deliveryFee = getDeliveryFee(deliveryType);
  const total = subtotal + deliveryFee - discount;

  const products = items
    .map((item) => `${item.product.name} (x${item.quantity})`)
    .join(", ");

  try {
    await fetch(
      "https://script.google.com/macros/s/AKfycbwwMhKXDsWueid2JhLExY_BxmCpIlynkUE1bNWglYr5OCT9BeWpyFZvtf-EVcnfeLhwKQ/exec",
      {
        method: "POST",
        body: JSON.stringify({
          name: customer.name,
          phone: customer.phone,
          city: customer.city,
          address: customer.address,
          products: products,
          total: total,
          payment: paymentType,
          delivery: deliveryType,
          deliveryFee: deliveryFee,
        }),
      }
    );
  } catch (e) {
    // Silent fail — order still goes through even if sheet fails
  }
}

/**
 * Open WhatsApp with the order message
 */
export function openWhatsApp(
  items: CartItem[],
  customer: CustomerInfo,
  paymentType: PaymentType,
  deliveryType: DeliveryType = "normal"
): void {
  const config = getSiteConfig();
  const message = generateWhatsAppMessage(items, customer, paymentType, deliveryType);
  const url = `https://wa.me/${config.whatsapp}?text=${message}`;
  window.open(url, "_blank");
}
