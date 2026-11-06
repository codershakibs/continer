import { gsap, prefersMotion } from './gsap';

function initDropdown(dropdown: HTMLElement) {
  const toggle = dropdown.querySelector<HTMLButtonElement>('.c-dropdown-toggle');
  const list = dropdown.querySelector<HTMLElement>('.c-dropdown-list');
  const box = list?.querySelector<HTMLElement>('.drop-inner-box');
  if (!toggle || !list || !box) return;

  let closeTimer: number | undefined;

  const open = () => {
    window.clearTimeout(closeTimer);
    if (dropdown.classList.contains('is-open')) return;
    dropdown.classList.add('is-open');
    list.classList.add('is-open');
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    if (prefersMotion()) {
      gsap.killTweensOf(box);
      gsap.fromTo(box, { height: 0, overflow: 'hidden' }, { height: 'auto', duration: 0.45, ease: 'power2.out', clearProps: 'height,overflow' });
    }
  };

  const close = () => {
    if (!dropdown.classList.contains('is-open')) return;
    dropdown.classList.remove('is-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    const hide = () => {
      if (!dropdown.classList.contains('is-open')) list.classList.remove('is-open');
    };
    if (prefersMotion()) {
      gsap.killTweensOf(box);
      gsap.to(box, { height: 0, overflow: 'hidden', duration: 0.3, ease: 'power2.in', clearProps: 'height,overflow', onComplete: hide });
    } else {
      hide();
    }
  };

  if (window.matchMedia('(hover: hover)').matches) {
    dropdown.addEventListener('pointerenter', open);
    dropdown.addEventListener('pointerleave', () => {
      closeTimer = window.setTimeout(close, 200);
    });
  }

  toggle.addEventListener('click', () => (dropdown.classList.contains('is-open') ? close() : open()));
  dropdown.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      close();
      toggle.focus();
    }
  });
  dropdown.addEventListener('focusout', (event) => {
    if (!dropdown.contains(event.relatedTarget as Node | null)) closeTimer = window.setTimeout(close, 200);
  });
  document.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target as Node)) close();
  });
}

function initMobileMenu() {
  const toggle = document.querySelector<HTMLButtonElement>('[data-mobile-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-mobile-menu]');
  if (!toggle || !menu) return;

  const setOpen = (open: boolean) => {
    toggle.classList.toggle('is-active', open);
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
  };

  toggle.addEventListener('click', () => setOpen(!menu.classList.contains('is-open')));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
}

export function initNavigation() {
  document.querySelectorAll<HTMLElement>('[data-dropdown]').forEach(initDropdown);
  initMobileMenu();
}
