import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error(
    "[Stripe] STRIPE_SECRET_KEY est manquant. " +
      "Copie le fichier .env.local.example et renseigne tes clés."
  );
}

/**
 * Singleton Stripe — une seule instance par processus Node.js.
 *
 * Sans ce pattern, Next.js recrée l'instance à chaque hot-reload en
 * développement, ce qui épuise les connexions et génère des warnings.
 * En production (lambda/serverless), `globalThis` est partagé sur la
 * durée de vie du worker — économie de cold-start.
 */
declare global {
  var _stripeClient: Stripe | undefined;
}

export const stripe: Stripe =
  globalThis._stripeClient ??
  new Stripe(stripeSecretKey, {
    // Version extraite du package installé (stripe v22) — garantit la
    // cohérence entre le runtime et les types TypeScript.
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
    // Timeout réseau conservateur pour les lambdas serverless
    timeout: 10_000,
    maxNetworkRetries: 2,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis._stripeClient = stripe;
}
