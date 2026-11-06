import { prefersMotion } from './gsap';

function initSlider(root: HTMLElement) {
  const mask = root.querySelector<HTMLElement>('.c-slider-mask');
  const slides = Array.from(root.querySelectorAll<HTMLElement>('.c-slide'));
  const prev = root.querySelector<HTMLElement>('.c-slider-arrow-left');
  const next = root.querySelector<HTMLElement>('.c-slider-arrow-right');
  const nav = root.querySelector<HTMLElement>('.c-slider-nav');
  if (!mask || slides.length < 2) return;

  const duration = prefersMotion() ? Number(root.dataset.duration ?? 500) : 0;
  let index = 0;
  const dots: HTMLButtonElement[] = [];

  const offsets = () => slides.map((slide) => slide.offsetLeft - slides[0].offsetLeft);

  const render = (animate = true) => {
    const positions = offsets();
    const distance = positions[index];
    slides.forEach((slide, i) => {
      const left = positions[i] - distance;
      const inView = left > -1 && left + slide.offsetWidth <= mask.clientWidth + 1;
      slide.style.transition = animate ? `transform ${duration}ms ease` : 'none';
      slide.style.transform = `translateX(${-distance}px)`;
      slide.toggleAttribute('inert', !inView);
      slide.setAttribute('aria-hidden', String(!inView));
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('c-active', i === index);
      dot.setAttribute('aria-current', String(i === index));
    });
  };

  const go = (target: number) => {
    index = (target + slides.length) % slides.length;
    render();
  };

  const asButton = (el: HTMLElement | null, label: string, action: () => void) => {
    if (!el) return;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', label);
    el.addEventListener('click', action);
    el.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        action();
      }
    });
  };

  asButton(prev, 'Previous slide', () => go(index - 1));
  asButton(next, 'Next slide', () => go(index + 1));

  if (nav) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'c-slider-dot';
      dot.setAttribute('aria-label', `Show slide ${i + 1}`);
      dot.addEventListener('click', () => go(i));
      nav.appendChild(dot);
      dots.push(dot);
    });
  }

  // Swipe
  let startX: number | null = null;
  mask.addEventListener('pointerdown', (event) => {
    startX = event.clientX;
  });
  mask.addEventListener('pointerup', (event) => {
    if (startX === null) return;
    const delta = event.clientX - startX;
    startX = null;
    if (Math.abs(delta) > 50) go(index + (delta < 0 ? 1 : -1));
  });

  if (root.dataset.autoplay === 'true' && prefersMotion()) {
    window.setInterval(() => go(index + 1), Number(root.dataset.delay ?? 4000));
  }

  window.addEventListener('resize', () => render(false));
  render(false);
}

export function initSliders() {
  document.querySelectorAll<HTMLElement>('.c-slider').forEach(initSlider);
}
