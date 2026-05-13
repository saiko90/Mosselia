import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "@/lib/data/mockProducts";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem extends Pick<Product, "id" | "name" | "scientificName" | "price"> {
  quantity: number;
}

interface CartState {
  items: CartItem[];

  /**
   * Flag d'hydratation — `false` côté SSR et au premier rendu client.
   * Passe à `true` après que `rehydrate()` a lu le localStorage.
   * Utilise ce flag dans l'UI pour éviter tout mismatch d'hydratation React.
   */
  _hasHydrated: boolean;

  // Actions
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;

  /**
   * Getter : total du panier en CHF.
   * Appelle `get()` → toujours à jour, pas de stale closure.
   *
   * @example
   * const total = useCartStore((s) => s.cartTotal());
   */
  cartTotal: () => number;

  // Hydration (usage interne, voir CartHydration.tsx)
  setHasHydrated: (value: boolean) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,

      // ── Actions ──────────────────────────────────────────────────────────

      addItem: (product) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id);

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                id: product.id,
                name: product.name,
                scientificName: product.scientificName,
                price: product.price,
                quantity: 1,
              },
            ],
          };
        });
      },

      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }));
      },

      clearCart: () => set({ items: [] }),

      cartTotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      // ── Hydration ─────────────────────────────────────────────────────────

      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),

    {
      name: "mosselia-cart-v1",

      /**
       * Accès localStorage uniquement côté client.
       * createJSONStorage lazy-initialise — aucun accès serveur.
       */
      storage: createJSONStorage(() => localStorage),

      /**
       * On ne persiste QUE les items.
       * _hasHydrated, setHasHydrated et cartTotal sont exclus du localStorage.
       */
      partialize: (state) => ({ items: state.items }),

      /**
       * skipHydration : désactive la réhydratation automatique au montage du store.
       *
       * POURQUOI : Zustand persist appelle localStorage de façon synchrone dès
       * l'initialisation du module. Sur le serveur, localStorage est undefined.
       * Sur le client, cela crée un état différent entre SSR (items: []) et
       * le premier rendu client (items: [...localStorage]), ce qui déclenche
       * un React Hydration Mismatch.
       *
       * SOLUTION : `skipHydration: true` + appel manuel de `rehydrate()` dans
       * un `useEffect` (CartHydration.tsx) → la mise à jour se produit APRÈS
       * que React a validé l'hydratation, et donc côté client uniquement.
       */
      skipHydration: true,

      /**
       * Callback déclenché APRÈS que rehydrate() a terminé de lire localStorage.
       * Passe _hasHydrated à true → l'UI peut afficher l'état réel du panier.
       */
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
