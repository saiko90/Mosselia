"use client";

import { useRef, useCallback } from "react";

interface ToneConfig {
  frequency: number;
  endFrequency: number;
  duration: number;
  gain: number;
  type: OscillatorType;
}

/**
 * Joue un son synthétique pur via l'oscillateur Web Audio.
 * Enveloppe : attaque instantanée → déclin exponentiel (tic d'horlogerie).
 */
function playTone(ctx: AudioContext, config: ToneConfig): void {
  const { frequency, endFrequency, duration, gain, type } = config;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  osc.frequency.exponentialRampToValueAtTime(endFrequency, now + duration);

  gainNode.gain.setValueAtTime(gain, now);
  // Déclin exponentiel — évite le "pop" de coupure abrupte
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.start(now);
  osc.stop(now + duration + 0.005);
}

/**
 * Hook de retour sonore micro-interactif.
 *
 * — L'AudioContext est créé paresseusement au premier appel (politique
 *   autoplay navigateur : le contexte doit naître d'un geste utilisateur).
 * — Aucun fichier audio externe : sons 100% synthétiques via oscillateurs.
 *
 * @example
 * const { playHover, playClick } = useAudioFeedback();
 * <button onMouseEnter={playHover} onClick={playClick}>CTA</button>
 */
export function useAudioFeedback() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;

    try {
      if (!ctxRef.current || ctxRef.current.state === "closed") {
        ctxRef.current = new AudioContext();
      }
      if (ctxRef.current.state === "suspended") {
        void ctxRef.current.resume();
      }
      return ctxRef.current;
    } catch {
      return null;
    }
  }, []);

  /**
   * Tic de survol — onde sinusoïdale 660→440 Hz, 80ms, très atténuée.
   * Simule le léger déclenchement mécanique d'un mécanisme d'horlogerie.
   */
  const playHover = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;

    playTone(ctx, {
      type: "sine",
      frequency: 660,
      endFrequency: 440,
      duration: 0.08,
      gain: 0.022,
    });
  }, [getCtx]);

  /**
   * Tic de clic — deux oscillateurs superposés pour un timbre plus riche :
   * - Corps principal (1200→800 Hz, attaque rapide)
   * - Resonance basse (220→110 Hz, corps du mécanisme)
   */
  const playClick = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;

    playTone(ctx, {
      type: "sine",
      frequency: 1200,
      endFrequency: 800,
      duration: 0.065,
      gain: 0.048,
    });

    playTone(ctx, {
      type: "sine",
      frequency: 220,
      endFrequency: 110,
      duration: 0.12,
      gain: 0.028,
    });
  }, [getCtx]);

  return { playHover, playClick };
}
