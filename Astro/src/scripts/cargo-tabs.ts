import { gsap, prefersMotion } from './gsap';

const INACTIVE = '#777777';
const ACTIVE = '#111111';

/** Workflow switcher on Home A: tabs swap the paragraph and the image alongside it. */
export function initCargoTabs() {
  const tabs = Array.from(document.querySelectorAll<HTMLElement>('.cargo-tab-link'));
  const contents = Array.from(document.querySelectorAll<HTMLElement>('.cargo-tab-content-block'));
  const images = Array.from(document.querySelectorAll<HTMLElement>('.tracking-image'));
  if (!tabs.length || !contents.length) return;

  let activeIndex = 0;
  const duration = (seconds: number) => (prefersMotion() ? seconds : 0);

  gsap.set(contents, { autoAlpha: 0, y: 20, pointerEvents: 'none' });
  gsap.set(contents[0], { autoAlpha: 1, y: 0, pointerEvents: 'auto' });
  gsap.set(images.slice(1), { autoAlpha: 0, scale: 1.06 });
  gsap.set(tabs, { color: INACTIVE, backgroundImage: `linear-gradient(${ACTIVE}, ${ACTIVE})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'left bottom', backgroundSize: '0% 1px' });
  gsap.set(tabs[0], { color: ACTIVE, backgroundSize: '100% 1px' });
  tabs.forEach((tab, index) => {
    tab.setAttribute('aria-selected', String(index === 0));
    tab.setAttribute('aria-label', tab.textContent?.trim() ?? '');
  });

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', (event) => {
      event.preventDefault();
      if (index === activeIndex) return;
      const old = activeIndex;
      activeIndex = index;
      tabs.forEach((item, i) => item.setAttribute('aria-selected', String(i === index)));

      gsap.timeline({ defaults: { ease: 'power3.out', overwrite: 'auto' } })
        .to(contents[old], { autoAlpha: 0, y: -15, duration: duration(0.35), pointerEvents: 'none' }, 0)
        .fromTo(contents[index], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: duration(0.55), pointerEvents: 'auto' }, 0.2)
        .to(images[old] ?? [], { autoAlpha: 0, scale: 1.04, duration: duration(0.45), ease: 'power2.inOut' }, 0)
        .fromTo(images[index] ?? [], { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: duration(0.85) }, 0.08)
        .to(tabs[old], { color: INACTIVE, backgroundSize: '0% 1px', duration: duration(0.35), ease: 'power2.inOut' }, 0)
        .to(tabs[index], { color: ACTIVE, backgroundSize: '100% 1px', duration: duration(0.5) }, 0.12);
    });
  });
}
