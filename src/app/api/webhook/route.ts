import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";

/**
 * POST /api/webhook
 *
 * Récepteur des événements Stripe. Vérifie la signature cryptographique
 * de chaque requête avant tout traitement — seul Stripe peut forger ces
 * événements avec le STRIPE_WEBHOOK_SECRET.
 *
 * CRITIQUE — Corps brut requis :
 * Stripe signe le corps exact de la requête HTTP (bytes bruts).
 * Si on appelle `req.json()` avant `constructEvent`, le corps est consommé
 * et la reconstruction de la signature échoue. On utilise `req.text()` qui
 * retourne la string brute sans parsing ni re-sérialisation.
 *
 * Config CLI en développement :
 *   stripe listen --forward-to http://localhost:3000/api/webhook
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 1. Lecture du corps brut ──────────────────────────────────────────────
  // DOIT être la première opération sur le body — stream à usage unique.
  const rawBody = await req.text();

  // ── 2. Récupération de la signature Stripe ────────────────────────────────
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    console.warn("[Webhook] En-tête stripe-signature manquant.");
    return NextResponse.json({ error: "En-tête stripe-signature manquant." }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Webhook] STRIPE_WEBHOOK_SECRET non configuré.");
    return NextResponse.json({ error: "Configuration serveur incomplète." }, { status: 500 });
  }

  // ── 3. Vérification cryptographique de la signature ───────────────────────
  // constructEvent lance une Stripe.errors.StripeSignatureVerificationError
  // si la signature est invalide ou si le timestamp est trop vieux (> 5 min
  // par défaut — protection contre les attaques par rejeu).
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.warn(`[Webhook] Signature invalide : ${message}`);
    return NextResponse.json({ error: `Signature webhook invalide : ${message}` }, { status: 400 });
  }

  // ── 4. Routage des événements ─────────────────────────────────────────────
  // On retourne 200 immédiatement pour les événements non gérés — Stripe
  // interprète tout statut >= 400 comme un échec et re-tente l'envoi.
  try {
    switch (event.type) {
      // ── Paiement confirmé ─────────────────────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log(`[Webhook] Paiement confirmé — session : ${session.id}`);
        console.log(`[Webhook] Montant : ${(session.amount_total ?? 0) / 100} CHF`);
        console.log(`[Webhook] Client : ${session.customer_email ?? "anonyme"}`);

        // TODO Sprint 7 : Décrémenter le stock dans la base de données.
        // Utiliser session.metadata.productId (ou récupérer les line_items via
        // stripe.checkout.sessions.listLineItems(session.id)) pour identifier
        // les produits achetés et leur quantité, puis faire un UPDATE atomique.
        //
        // IDEMPOTENCE : Stripe peut envoyer le même événement plusieurs fois.
        // Stocker session.id comme clé unique et vérifier son existence avant
        // de décrémenter pour éviter les doublons.

        break;
      }

      // ── Paiement expiré (session 30 min) ──────────────────────────────────
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`[Webhook] Session expirée : ${session.id}`);
        // TODO Sprint 7 : Libérer la réservation de stock si applicable.
        break;
      }

      // ── Remboursement ─────────────────────────────────────────────────────
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        console.log(`[Webhook] Remboursement : ${charge.id}`);
        // TODO Sprint 7 : Réincrémenter le stock.
        break;
      }

      // ── Événements non gérés : log silencieux ─────────────────────────────
      default:
        console.debug(`[Webhook] Événement ignoré : ${event.type}`);
    }
  } catch (err) {
    console.error(`[Webhook] Erreur lors du traitement de ${event.type} :`, err);
    // On retourne quand même 200 pour éviter les re-tentatives infinies.
    // L'erreur doit être supervisée via Sentry ou similaire (Sprint 8).
  }

  // ── 5. Accusé de réception ────────────────────────────────────────────────
  return NextResponse.json({ received: true }, { status: 200 });
}
