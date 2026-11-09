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

  // Smooth-scroll in-page links such as the About C principle menu. Lenis's own `anchors`
  // option is not used because it also scrolls for links another script has already handled,
  // like the blog category tabs.
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]:not([href="#"]):not([role="tab"])');
    const target = link && document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (!target) return;
    event.preventDefault();
    lenis.scrollTo(target);
    history.replaceState(null, '', link.hash);
  });
}
