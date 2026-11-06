import { gsap, ScrollTrigger, prefersMotion } from './gsap';

const DURATION = 0.45;

function setItem(item: HTMLElement, open: boolean) {
  const panel = item.querySelector<HTMLElement>('.faq-item-bottom');
  const header = item.querySelector<HTMLElement>('.faq-item-top');
  item.classList.toggle('active', open);
  item.querySelector('.faq-item-icon-lline-2')?.classList.toggle('active', open);
  header?.setAttribute('aria-expanded', String(open));
  if (!panel || !prefersMotion()) return;

  gsap.killTweensOf(panel);
  gsap.fromTo(
    panel,
    { height: open ? 0 : panel.offsetHeight },
    { height: open ? 'auto' : 0, duration: DURATION, ease: 'power2.out', clearProps: 'height', onComplete: () => ScrollTrigger.refresh() },
  );
}

export function initFaq() {
  const items = document.querySelectorAll<HTMLElement>('.faq-item');
  items.forEach((item, index) => {
    const header = item.querySelector<HTMLElement>('.faq-item-top');
    const panel = item.querySelector<HTMLElement>('.faq-item-bottom');
    if (!header || !panel) return;

    const panelId = `faq-panel-${index}`;
    panel.id = panelId;
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-controls', panelId);
    header.setAttribute('aria-expanded', String(item.classList.contains('active')));

    const toggle = () => {
      const willOpen = !item.classList.contains('active');
      const group = item.parentElement;
      group?.querySelectorAll<HTMLElement>(':scope > .faq-item.active').forEach((other) => {
        if (other !== item) setItem(other, false);
      });
      setItem(item, willOpen);
    };

    header.addEventListener('click', toggle);
    header.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle();
      }
    });
  });
}
