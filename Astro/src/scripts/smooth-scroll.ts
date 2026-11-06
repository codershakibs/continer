import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap';

export function initSmoothScroll() {
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
