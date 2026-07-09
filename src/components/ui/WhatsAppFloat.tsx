"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { getSiteConfig } from "@/lib/products";

export default function WhatsAppFloat() {
  const config = getSiteConfig();
  const whatsappUrl = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent("Assalam-o-Alaikum! I have a question about your products.")}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
      className="fixed bottom-24 lg:bottom-8 right-5 z-40 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 whatsapp-pulse"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </motion.a>
  );
}
