"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";

/**
 * Déclenche la réhydratation du panier depuis localStorage.
 *
 * Placé dans RootLayout, rendu une seule fois par session.
 * L'appel se fait dans useEffect → APRÈS que React a validé l'hydratation
 * SSR/CSR → aucun mismatch possible.
 *
 * Une fois rehydrate() terminé, onRehydrateStorage passe _hasHydrated à true
 * et les composants abonnés se re-rendent avec le panier réel.
 */
export function CartHydration() {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  return null;
}
