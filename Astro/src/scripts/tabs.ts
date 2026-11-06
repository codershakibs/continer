import { gsap, ScrollTrigger, prefersMotion } from './gsap';

export function initTabs() {
  for (const root of document.querySelectorAll<HTMLElement>('[data-tabs]')) {
    const tabs = Array.from(root.querySelectorAll<HTMLElement>('[data-tab]'));
    const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-tab-panel]'));

    const activate = (tab: HTMLElement) => {
      const id = tab.dataset.tab;
      tabs.forEach((item) => {
        const selected = item === tab;
        item.classList.toggle('is-current', selected);
        item.setAttribute('aria-selected', String(selected));
        item.setAttribute('tabindex', selected ? '0' : '-1');
      });
      panels.forEach((panel) => {
        const active = panel.dataset.tabPanel === id;
        panel.classList.toggle('is-active', active);
        if (active && prefersMotion()) gsap.fromTo(panel, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out', clearProps: 'all' });
      });
      ScrollTrigger.refresh();
    };

    tabs.forEach((tab, index) => {
      tab.setAttribute('tabindex', tab.classList.contains('is-current') ? '0' : '-1');
      tab.addEventListener('click', (event) => {
        event.preventDefault();
        activate(tab);
      });
      tab.addEventListener('keydown', (event) => {
        const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
        if (!step) return;
        event.preventDefault();
        const next = tabs[(index + step + tabs.length) % tabs.length];
        next.focus();
        activate(next);
      });
    });
  }
}
