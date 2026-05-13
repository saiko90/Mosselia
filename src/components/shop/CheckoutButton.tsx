"use client";

import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { formatPriceCHF } from "@/lib/utils";

// ─── CheckoutButton ───────────────────────────────────────────────────────────

/**
 * Bouton de validation du Drop.
 *
 * Flux :
 *  1. Lit le panier Zustand (items + cartTotal)
 *  2. POST /api/checkout → { url } (prix validés côté serveur)
 *  3. Redirige vers Stripe Hosted Checkout
 *
 * Sécurité : seuls les IDs et quantités sont envoyés au serveur.
 * Les prix sont ignorés — la route API les relit depuis le catalogue.
 *
 * Hydratation : le bouton est désactivé tant que _hasHydrated est false,
 * ce qui évite un clic accidentel avant que le panier réel soit chargé.
 */
export function CheckoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const items = useCartStore((s) => s.items);
  const cartTotal = useCartStore((s) => s.cartTotal);
  const hasHydrated = useCartStore((s) => s._hasHydrated);

  const total = hasHydrated ? cartTotal() : 0;
  const isEmpty = !hasHydrated || items.length === 0;
  const isDisabled = isEmpty || isLoading;

  const handleCheckout = async () => {
    if (isDisabled) return;
    setIsLoading(true);
    setError(null);

    try {
      // ── Payload Zero-Trust : uniquement IDs + quantités ─────────────────
      const payload = {
        items: items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? `Erreur serveur (${res.status})`);
      }

      const { url } = (await res.json()) as { url: string };

      if (!url) {
        throw new Error("URL de paiement introuvable dans la réponse.");
      }

      // ── Redirection vers Stripe Hosted Checkout ──────────────────────────
      // On utilise window.location pour garantir une navigation complète
      // (Stripe a besoin d'un contexte navigateur propre).
      window.location.href = url;

      // Note : setIsLoading(false) n'est pas appelé ici intentionnellement.
      // La redirection navigue hors de la page — le spinner reste visible
      // pendant le chargement de Stripe, ce qui est l'UX attendu.
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur inattendue est survenue.";
      setError(message);
      setIsLoading(false);
    }
  };

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-end gap-2">
      {/* Message d'erreur */}
      {error && (
        <p role="alert" className="font-mono text-[10px] text-moss-rose text-right max-w-xs">
          {error}
        </p>
      )}

      <button
        onClick={handleCheckout}
        disabled={isDisabled}
        aria-busy={isLoading}
        aria-label={
          isEmpty ? "Aucun spécimen sélectionné" : `Valider le Drop — ${formatPriceCHF(total)}`
        }
        className={[
          "relative flex items-center gap-3 px-8 py-3.5",
          "font-sans text-[11px] tracking-[0.2em] uppercase",
          "border transition-all duration-500 outline-none",
          "focus-visible:ring-1 focus-visible:ring-moss-accent focus-visible:ring-offset-2",
          isDisabled
            ? "border-moss-forest/15 text-moss-forest/30 cursor-not-allowed"
            : "border-moss-forest bg-moss-forest text-moss-paper hover:bg-moss-forest-mid",
        ].join(" ")}
      >
        {/* Indicateur de chargement */}
        {isLoading && (
          <span
            className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
        )}

        {/* Label */}
        <span>
          {isLoading
            ? "Connexion à Stripe…"
            : isEmpty
              ? "Panier vide"
              : `Valider le Drop · ${formatPriceCHF(total)}`}
        </span>
      </button>
    </div>
  );
}
