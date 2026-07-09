"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  isInCart: (slug: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(
            (item) => item.product.slug === product.slug
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product.slug === product.slug
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, { product, quantity }] };
        });
      },

      removeItem: (slug) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.slug !== slug),
        }));
      },

      updateQuantity: (slug, quantity) => {
        if (quantity <= 0) {
          get().removeItem(slug);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product.slug === slug ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.salePrice ?? item.product.price;
          return total + price * item.quantity;
        }, 0);
      },

      isInCart: (slug) => {
        return get().items.some((item) => item.product.slug === slug);
      },
    }),
    {
      name: "bazaarnow-cart",
    }
  )
);
