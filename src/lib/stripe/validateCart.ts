import { mockProducts } from "@/lib/data/mockProducts";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Payload minimal envoyé par le client (Zustand).
 * Contient UNIQUEMENT les identifiants — jamais les prix.
 */
export interface CartPayloadItem {
  id: string;
  quantity: number;
}

/**
 * Structure d'un line_item Stripe Checkout.
 * Définie localement pour s'affranchir des changements de namespace
 * entre les versions majeures du SDK Stripe (v22 a restructuré les types).
 */
export interface StripeLineItem {
  price_data: {
    currency: "chf";
    product_data: {
      name: string;
      description: string;
      metadata: Record<string, string>;
    };
    unit_amount: number; // en centimes
  };
  quantity: number;
}

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Valide le panier côté serveur selon le modèle Zero-Trust.
 *
 * SÉCURITÉ : Le client ne transmet que des IDs et des quantités.
 * Cette fonction est la seule source de vérité pour les prix :
 * elle les lit dans mockProducts (future DB) et les impose à Stripe.
 * Un attaquant qui modifie le prix dans Zustand ou dans la requête
 * n'aura aucun effet — le montant facturé est toujours celui du catalogue.
 *
 * @throws {CartValidationError} Produit inconnu, quantité invalide, stock insuffisant.
 * @returns Tableau de line_items prêt pour `stripe.checkout.sessions.create`.
 */
export function validateCart(items: CartPayloadItem[]): StripeLineItem[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new CartValidationError("Le panier est vide.", 400);
  }

  return items.map((item) => {
    // ── 1. Vérification de l'ID ──────────────────────────────────────────
    const product = mockProducts.find((p) => p.id === item.id);
    if (!product) {
      throw new CartValidationError(
        `Produit introuvable : "${item.id}". Possible tentative de manipulation.`,
        404
      );
    }

    // ── 2. Vérification de la quantité ───────────────────────────────────
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      throw new CartValidationError(
        `Quantité invalide (${item.quantity}) pour "${product.name}".`,
        400
      );
    }

    // ── 3. Vérification du stock ─────────────────────────────────────────
    // TODO Sprint 7 : remplacer par une lecture atomique en base de données
    // pour gérer les conditions de course (deux acheteurs simultanés).
    if (item.quantity > product.stock) {
      throw new CartValidationError(
        `Stock insuffisant pour "${product.name}". ` +
          `Demandé : ${item.quantity}, disponible : ${product.stock}.`,
        409
      );
    }

    // ── 4. Construction du line_item ─────────────────────────────────────
    // Les prix sont imposés par le serveur — le client n'a aucune influence.
    // CHF → centimes : Stripe attend toujours des entiers (smallest currency unit).
    return {
      price_data: {
        currency: "chf" as const,
        product_data: {
          name: product.name,
          description: product.scientificName,
          metadata: { productId: product.id },
        },
        unit_amount: product.price * 100,
      },
      quantity: item.quantity,
    };
  });
}

// ─── Erreur métier ────────────────────────────────────────────────────────────

export class CartValidationError extends Error {
  constructor(
    message: string,
    public readonly statusCode: 400 | 404 | 409 = 400
  ) {
    super(message);
    this.name = "CartValidationError";
  }
}
