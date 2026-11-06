import { gsap, SplitText } from './gsap';

interface RollTarget {
  trigger: string;
  text: string;
  y: string;
  stagger: number;
}

const ROLLS: RollTarget[] = [
  { trigger: '.primary-btn', text: '.button-text', y: '-1.5em', stagger: 0.009 },
  { trigger: '.link-block', text: '.button-text', y: '-1.5em', stagger: 0.009 },
  { trigger: '.button', text: '.morning-snow-top, .morning-snow-bottom', y: '-100%', stagger: 0.02 },
];

/** Rolls button labels character by character. Splitting is deferred to the first hover. */
export function initHoverText() {
  if (!window.matchMedia('(hover: hover)').matches) return;

  for (const { trigger, text, y, stagger } of ROLLS) {
    for (const link of document.querySelectorAll<HTMLElement>(trigger)) {
      let chars: Element[] | undefined;
      link.addEventListener('pointerenter', () => {
        chars ??= Array.from(link.querySelectorAll(text)).flatMap((el) => SplitText.create(el, { type: 'chars' }).chars);
        gsap.to(chars, { y, duration: 0.35, ease: 'power2.out', stagger, overwrite: true });
      });
      link.addEventListener('pointerleave', () => {
        if (chars) gsap.to(chars, { y: 0, duration: 0.35, ease: 'power2.out', overwrite: true });
      });
    }
  }
}
