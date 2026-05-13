"use client";

import { m } from "framer-motion";
import { useAudioFeedback } from "@/hooks/useAudioFeedback";
import { useCartStore } from "@/store/useCartStore";
import { cn, formatPriceCHF } from "@/lib/utils";
import type { Product } from "@/lib/data/mockProducts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product;
  /** La première carte de la galerie est mise en avant (image plus haute). */
  featured?: boolean;
}

// ─── Stock badge ──────────────────────────────────────────────────────────────

function StockBadge({ stock }: { stock: number }) {
  const critical = stock <= 2;
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          critical ? "bg-moss-rose animate-pulse" : "bg-moss-accent"
        )}
      />
      <span
        className={cn(
          "font-mono text-[10px] tracking-[0.2em] uppercase",
          critical ? "text-moss-rose" : "text-moss-accent"
        )}
      >
        {critical
          ? `${stock} spécimen${stock > 1 ? "s" : ""} disponible${stock > 1 ? "s" : ""}`
          : "Stock limité"}
      </span>
    </div>
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────

export function ProductCard({ product, featured = false }: ProductCardProps) {
  const { playHover, playClick } = useAudioFeedback();

  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s._hasHydrated);

  /**
   * On gate inCart sur hasHydrated pour garantir que SSR et premier rendu
   * client produisent le même résultat (bouton = "Réserver" dans les deux cas).
   * Après rehydrate(), l'abonnement Zustand met à jour le composant.
   */
  const inCart = hasHydrated && items.some((i) => i.id === product.id);

  const handleAdd = () => {
    playClick();
    addItem(product);
  };

  return (
    <m.article
      className={cn(
        "group relative flex flex-col overflow-hidden",
        "border border-moss-forest/[0.08] bg-moss-surface",
        "cursor-default select-none"
      )}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -6,
        boxShadow: "0 24px 64px rgba(26, 51, 38, 0.10)",
      }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ── Image placeholder ─────────────────────────────────────────────── */}
      <div
        className={cn(
          "w-full flex-shrink-0 overflow-hidden",
          featured ? "h-72 md:h-80" : "h-52 md:h-60"
        )}
        aria-hidden="true"
      >
        {/* Grain texture overlay via mix-blend */}
        <div
          className="w-full h-full relative"
          style={{ background: product.imagePlaceholder.gradient }}
        >
          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

          {/* Specimen number — watermark style */}
          <span
            className="absolute bottom-4 right-5 font-mono text-[9px] tracking-[0.25em] uppercase opacity-40"
            style={{ color: product.imagePlaceholder.accentColor }}
          >
            Spécimen certifié
          </span>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 gap-5 p-7">
        <StockBadge stock={product.stock} />

        {/* Name + scientific */}
        <div className="space-y-1.5">
          <h3 className="font-serif text-xl font-semibold leading-tight text-moss-forest">
            {product.name}
          </h3>
          <p className="font-sans text-[11px] italic tracking-wide text-moss-forest/45 leading-relaxed">
            {product.scientificName}
          </p>
        </div>

        {/* Description */}
        <p className="font-sans text-sm leading-[1.75] text-moss-forest/65 flex-1">
          {product.description}
        </p>

        {/* ── Footer : price + CTA ────────────────────────────────────────── */}
        <div className="flex items-end justify-between gap-4 pt-5 border-t border-moss-forest/[0.07]">
          {/* Price */}
          <div className="flex flex-col">
            <span className="font-serif text-2xl font-semibold leading-none text-moss-forest">
              {formatPriceCHF(product.price)}
            </span>
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-moss-forest/40 mt-1">
              Hors TVA
            </span>
          </div>

          {/* CTA */}
          <m.button
            className={cn(
              "relative px-5 py-2.5 font-sans text-[10px] tracking-[0.2em] uppercase",
              "border transition-colors duration-500 outline-none focus-visible:ring-1",
              "focus-visible:ring-moss-accent focus-visible:ring-offset-2",
              inCart
                ? "border-moss-forest bg-moss-forest text-moss-paper"
                : "border-moss-forest/25 text-moss-forest hover:border-moss-forest hover:bg-moss-forest hover:text-moss-paper"
            )}
            onMouseEnter={playHover}
            onClick={handleAdd}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.12 }}
            aria-label={`Ajouter ${product.name} au Drop`}
            disabled={inCart}
          >
            {inCart ? "✓ Dans le Drop" : "Réserver →"}
          </m.button>
        </div>
      </div>
    </m.article>
  );
}
