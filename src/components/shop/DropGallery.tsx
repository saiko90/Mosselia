import { mockProducts } from "@/lib/data/mockProducts";
import { ProductCard } from "./ProductCard";

/**
 * Server Component — aucun JS envoyé pour ce conteneur.
 * Lit les données côté serveur et les passe aux ProductCard (Client Components).
 * Le layout asymétrique crée une lecture diagonale typique galerie d'exposition.
 */
export function DropGallery() {
  const products = mockProducts;

  return (
    <section className="w-full max-w-5xl mx-auto px-6 md:px-12 pb-32">
      {/* ── En-tête éditorial ──────────────────────────────────────────────── */}
      <header className="mb-20 flex flex-col gap-3">
        <span className="font-mono text-[10px] tracking-[0.35em] uppercase text-moss-accent">
          Drop I — Saison 2025
        </span>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-moss-forest leading-none">
            Collection
            <br />
            <em className="font-normal not-italic text-moss-forest/50">Vivante</em>
          </h2>

          <p className="font-sans text-sm max-w-xs text-moss-forest/55 leading-relaxed md:text-right">
            Spécimens botaniques rares issus de mutations somatiques et chimères génétiques
            certifiées. Chaque clone est documenté et traçable.
          </p>
        </div>

        {/* Ligne de séparation fine */}
        <div className="mt-4 h-px bg-moss-forest/10" />
      </header>

      {/* ── Galerie asymétrique ────────────────────────────────────────────── */}
      {/*
       * Layout : 2 colonnes avec décalage vertical sur les cartes paires.
       * Colonne gauche : indices 0, 2 (flush top)
       * Colonne droite : indices 1, 3 (décalés vers le bas de mt-20)
       * → Lecture diagonale ↘ qui évoque une disposition muséale.
       */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
        {products.map((product, index) => (
          <div key={product.id} className={index % 2 === 1 ? "md:mt-20" : undefined}>
            <ProductCard product={product} featured={index === 0} />
          </div>
        ))}
      </div>

      {/* ── Pied de section ───────────────────────────────────────────────── */}
      <footer className="mt-16 flex flex-col items-center gap-3 text-center">
        <div className="h-px w-12 bg-moss-forest/15" />
        <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-moss-forest/35">
          Les drops ferment sans préavis · Quantités définitivement limitées
        </p>
      </footer>
    </section>
  );
}
