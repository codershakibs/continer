import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap';

export function initSmoothScroll() {
  // Lenis re-measures the page when its content element resizes. The base styles give
  // <html> `height: 100%`, so it never resizes; <body> grows with the page, so watch that.
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, content: document.body });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Layout changes after load (images, fonts, split text, accordions) also refresh ScrollTrigger.
  ScrollTrigger.addEventListener('refresh', () => lenis.resize());
  window.addEventListener('load', () => lenis.resize());
}
