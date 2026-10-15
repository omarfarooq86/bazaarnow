"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  /**
   * False until the persisted cart has been read back from localStorage. Consumers
   * need this to tell "genuinely empty" apart from "not loaded yet" — on first paint
   * every cart looks empty, which is what used to bounce /checkout to /cart on a
   * refresh.
   */
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
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
      _hasHydrated: false,

      setHasHydrated: (value) => set({ _hasHydrated: value }),

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
      // Persist the cart only. The hydration flag is UI state — writing it to storage
      // would just be a value that has to be overwritten on every load.
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        // Fires once the persisted cart has been read, whether or not anything was
        // stored — with empty storage `state` is still the live store, so this lands
        // in both cases. Deliberately uses `state` rather than a `useCartStore`
        // reference: with synchronous localStorage this callback runs *during*
        // create(), while the exported binding is still in its temporal dead zone.
        state?.setHasHydrated(true);
      },
    }
  )
);
