import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { validateCart, CartValidationError, type CartPayloadItem } from "@/lib/stripe/validateCart";

// ─── Type guards ──────────────────────────────────────────────────────────────

function isValidItem(item: unknown): item is CartPayloadItem {
  if (typeof item !== "object" || item === null) return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    obj.id.length > 0 &&
    Number.isInteger(obj.quantity) &&
    (obj.quantity as number) > 0
  );
}

/**
 * Vérifie que le body JSON est bien `{ items: CartPayloadItem[] }`.
 * On ne fait jamais confiance au client — validation explicite sans Zod.
 */
function isValidBody(body: unknown): body is { items: CartPayloadItem[] } {
  if (typeof body !== "object" || body === null) return false;
  const obj = body as Record<string, unknown>;
  if (!Array.isArray(obj.items) || obj.items.length === 0) return false;
  return (obj.items as unknown[]).every(isValidItem);
}

// ─── POST /api/checkout ───────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 1. Lecture et validation du body ─────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide." }, { status: 400 });
  }

  if (!isValidBody(body)) {
    return NextResponse.json(
      {
        error: "Payload invalide : items[] requis avec id (string) et quantity (entier > 0).",
      },
      { status: 400 }
    );
  }

  // ── 2. Validation Zero-Trust (prix imposés côté serveur) ─────────────────
  let lineItems: ReturnType<typeof validateCart>;
  try {
    lineItems = validateCart(body.items);
  } catch (err) {
    if (err instanceof CartValidationError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }

  // ── 3. URLs de redirection ────────────────────────────────────────────────
  // On privilégie l'en-tête Origin (fiable en prod) avec le fallback sur
  // NEXT_PUBLIC_BASE_URL (utile en dev / CI sans reverse-proxy).
  const origin =
    req.headers.get("origin") ?? process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  // {CHECKOUT_SESSION_ID} est un template Stripe — remplacé côté Stripe
  // lors de la redirection vers success_url.
  const successUrl = `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/?checkout=cancel`;

  // ── 4. Création de la session Stripe Checkout ─────────────────────────────
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      // Expire après 30 min — adapté aux drops à faible stock
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      // Métadonnées transmises au webhook
      metadata: {
        source: "mosselia-drop",
        itemCount: String(body.items.length),
      },
      // Adresse de facturation requise pour conformité TVA suisse
      billing_address_collection: "required",
      allow_promotion_codes: false,
      phone_number_collection: { enabled: false },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "La session Stripe n'a pas retourné d'URL." },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err) {
    console.error("[Checkout] Erreur Stripe :", err);
    return NextResponse.json(
      {
        error: "Impossible de créer la session de paiement. Réessaie dans quelques instants.",
      },
      { status: 502 }
    );
  }
}
