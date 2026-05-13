"use client";

import { useCartStore } from "@/store/useCartStore";
import { CheckoutButton } from "./CheckoutButton";
import { formatPriceCHF } from "@/lib/utils";

/**
 * Barre sticky fixée en bas de l'écran.
 * Invisible si le panier est vide ou non hydraté.
 * Affiche le récapitulatif (N spécimens, total) + CheckoutButton.
 */
export function CartBar() {
  const items = useCartStore((s) => s.items);
  const cartTotal = useCartStore((s) => s.cartTotal);
  const hasHydrated = useCartStore((s) => s._hasHydrated);

  const itemCount = hasHydrated ? items.reduce((sum, i) => sum + i.quantity, 0) : 0;

  // Masqué si panier vide — évite toute flicker côté serveur grâce à hasHydrated
  if (!hasHydrated || itemCount === 0) return null;

  return (
    <div
      role="region"
      aria-label="Récapitulatif du panier"
      className={[
        "fixed bottom-0 left-0 right-0 z-[80]",
        "bg-moss-paper/95 backdrop-blur-md",
        "border-t border-moss-forest/10",
      ].join(" ")}
    >
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between gap-6">
        {/* Récapitulatif */}
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-moss-forest/45">
            {itemCount} spécimen{itemCount > 1 ? "s" : ""} sélectionné
            {itemCount > 1 ? "s" : ""}
          </span>
          <span className="font-serif text-xl font-semibold text-moss-forest leading-none">
            {formatPriceCHF(cartTotal())}
          </span>
        </div>

        {/* Bouton de checkout */}
        <CheckoutButton />
      </div>
    </div>
  );
}
