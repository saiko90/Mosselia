/**
 * Concatène des classes CSS conditionnellement.
 * Équivalent léger de clsx — pas de dépendance externe.
 */
export function cn(...classes: Array<string | undefined | false | null>): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Formate un prix en CHF selon la locale suisse-française.
 * ex: 4800 → "4 800.–"
 */
export function formatPriceCHF(price: number): string {
  return new Intl.NumberFormat("fr-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
