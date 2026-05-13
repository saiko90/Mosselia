"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import { type ReactNode } from "react";

/**
 * Charge uniquement le sous-ensemble `domAnimation` de Framer Motion.
 * Utilise `strict` pour forcer l'usage de `m.*` (pas `motion.*`) dans les
 * composants enfants — garantit que le bundle complet ne sera jamais chargé.
 *
 * Usage dans les composants : importer `m` depuis "framer-motion"
 *   import { m } from "framer-motion";
 *   <m.div animate={{ opacity: 1 }} />
 */
export function AnimationProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
