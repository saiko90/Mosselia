"use client";

import { m } from "framer-motion";
import { type ReactNode } from "react";

/**
 * template.tsx : contrairement à layout.tsx, Next.js crée une nouvelle
 * instance à chaque navigation. L'animation se rejoue donc à chaque
 * changement de page — effet de fondu d'entrée sur 0.8s.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="flex flex-col flex-1"
    >
      {children}
    </m.div>
  );
}
