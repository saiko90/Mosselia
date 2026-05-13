import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Index" });

  return {
    title: t("metaTitle"),
  };
}

export default async function HomePage() {
  const t = await getTranslations("Index");

  return (
    <main className="flex flex-1 w-full flex-col items-center justify-center px-8 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        {t("description")}
      </p>
    </main>
  );
}
