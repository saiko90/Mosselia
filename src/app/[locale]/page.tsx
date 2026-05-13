import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DropGallery } from "@/components/shop/DropGallery";
import { CartBar } from "@/components/shop/CartBar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Index" });
  return { title: t("metaTitle") };
}

export default async function HomePage() {
  const t = await getTranslations("Index");

  return (
    <>
      <main className="flex flex-col flex-1 w-full">
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="w-full max-w-5xl mx-auto px-6 md:px-12 pt-28 pb-20">
          <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-moss-accent mb-6">
            Mosselia — Botanique d&apos;auteur
          </p>

          <h1 className="font-serif text-5xl md:text-7xl font-semibold text-moss-forest leading-[1.05] tracking-tight max-w-2xl">
            {t("title")}
          </h1>

          <p className="mt-6 font-sans text-base md:text-lg leading-relaxed text-moss-forest/60 max-w-lg">
            {t("description")}
          </p>

          <div className="flex items-center gap-4 mt-10">
            <div className="h-px flex-1 max-w-[60px] bg-moss-forest/15" />
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-moss-forest/30">
              Collection vivante
            </span>
            <div className="h-px flex-1 max-w-[60px] bg-moss-forest/15" />
          </div>
        </section>

        {/* ── Drop Gallery ────────────────────────────────────────────────────── */}
        <DropGallery />

        {/* Espace pour que la barre sticky ne masque pas le pied de galerie */}
        <div className="h-28" aria-hidden="true" />
      </main>

      {/* ── Barre de checkout persistante ─────────────────────────────────────── */}
      <CartBar />
    </>
  );
}
