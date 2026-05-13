"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Constants ────────────────────────────────────────────────────────────────

const FOG_COLOR = "#f5f2eb"; // Identique à moss-paper pour un fondu parfait
const FOG_DENSITY = 0.045; // fogExp2 — falloff exponentiel

const PARTICLE_COUNT = 110;

// ─── Seed data (module scope) ─────────────────────────────────────────────────
// Calculé une seule fois au chargement du module — aucun risque de réexécution
// à chaque rendu et conforme à la règle react-hooks/purity.

const SEED_X = new Float32Array(PARTICLE_COUNT);
const SEED_Y = new Float32Array(PARTICLE_COUNT);
const SEED_Z = new Float32Array(PARTICLE_COUNT);
const SEED_PHASE = new Float32Array(PARTICLE_COUNT);

for (let i = 0; i < PARTICLE_COUNT; i++) {
  SEED_X[i] = (Math.random() - 0.5) * 24;
  SEED_Y[i] = (Math.random() - 0.5) * 13;
  SEED_Z[i] = (Math.random() - 0.5) * 18;
  SEED_PHASE[i] = Math.random() * Math.PI * 2;
}

// ─── FloatingDust ─────────────────────────────────────────────────────────────

function FloatingDust() {
  const pointsRef = useRef<THREE.Points>(null);

  // Construit la géométrie à partir des seeds — stable entre les renders
  const geometry = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3 + 0] = SEED_X[i];
      positions[i * 3 + 1] = SEED_Y[i];
      positions[i * 3 + 2] = SEED_Z[i];
    }

    const geo = new THREE.BufferGeometry();
    const attr = new THREE.BufferAttribute(positions, 3);
    // DynamicDrawUsage : optimisation GPU pour un buffer mis à jour chaque frame
    attr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("position", attr);
    return geo;
  }, []);

  // Cleanup mémoire GPU à l'unmount
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.elapsedTime;
    const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Dérive verticale : onde lente par particule (phase individuelle)
      pos.setY(i, SEED_Y[i] + Math.sin(t * 0.17 + SEED_PHASE[i]) * 0.4);
      // Shimmer horizontal : fréquence distincte pour un mouvement organique
      pos.setX(i, SEED_X[i] + Math.sin(t * 0.09 + SEED_PHASE[i] * 1.7) * 0.25);
    }

    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.055}
        color={new THREE.Color("#7a9b76")}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ─── Scene ────────────────────────────────────────────────────────────────────

function Scene() {
  return (
    <>
      {/* Fond de scène — identique au papier pour que le fog soit invisible */}
      <color attach="background" args={[FOG_COLOR]} />

      {/* Brume exponentielle : fondu organique dans le lointain */}
      <fogExp2 attach="fog" args={[FOG_COLOR, FOG_DENSITY]} />

      {/* Lumière ambiante chaude (teinte papier patiné) */}
      <ambientLight intensity={0.7} color="#d8d0bc" />

      {/* Lumière directionnelle principale — prête pour les ombres de plantes */}
      <directionalLight position={[4, 9, 3]} intensity={1.1} color="#f0e8d4" castShadow />

      {/* Contre-jour vert depuis le fond — profondeur et mystère végétal */}
      <directionalLight position={[-6, 2, -9]} intensity={0.25} color="#7a9b76" />

      <FloatingDust />
    </>
  );
}

// ─── VirtualJungle ────────────────────────────────────────────────────────────

/**
 * Canvas 3D en position fixe derrière toute l'interface (z-index: -1).
 * Persistant entre les navigations car intégré dans le RootLayout.
 * `pointer-events: none` garantit qu'il ne capte aucun événement souris.
 */
export function VirtualJungle() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        background: FOG_COLOR, // Fallback avant initialisation WebGL
      }}
      aria-hidden="true"
    >
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 10], fov: 50, near: 0.1, far: 100 }}
        gl={{ antialias: false }}
        style={{ display: "block" }}
      >
        {/*
         * Suspense null-fallback : si un asset futur (modèle GLTF, texture)
         * est ajouté dans la Scene, il sera streamé sans bloquer le rendu.
         */}
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
