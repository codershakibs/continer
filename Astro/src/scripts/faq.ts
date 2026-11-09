import { gsap, ScrollTrigger, prefersMotion } from './gsap';

const DURATION = 0.45;

function setItem(item: HTMLElement, open: boolean) {
  const panel = item.querySelector<HTMLElement>('.faq-item-bottom');
  const header = item.querySelector<HTMLElement>('.faq-item-top');
  if (!panel) return;

  // Measure before the class change: CSS collapses or expands the panel instantly.
  const from = panel.getBoundingClientRect().height;

  item.classList.toggle('active', open);
  item.querySelector('.faq-item-icon-lline-2')?.classList.toggle('active', open);
  header?.setAttribute('aria-expanded', String(open));

  if (!prefersMotion()) {
    ScrollTrigger.refresh();
    return;
  }

  // The panel clips its content, so scrollHeight is the full open height.
  const to = open ? panel.scrollHeight : 0;
  gsap.killTweensOf(panel);
  gsap.fromTo(
    panel,
    { height: from },
    {
      height: to,
      duration: DURATION,
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.set(panel, { clearProps: 'height' });
        ScrollTrigger.refresh();
      },
    },
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
      item.parentElement?.querySelectorAll<HTMLElement>(':scope > .faq-item.active').forEach((other) => {
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
