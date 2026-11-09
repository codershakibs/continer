/**
 * Highlights in-page links (href="#section") while their section is on screen, as Webflow did
 * with `w--current`. A section counts as current while it crosses the middle of the viewport.
 * Between two sections the last one stays highlighted, so the highlight doesn't flicker; above
 * the first and below the last section nothing is highlighted.
 */
export function initScrollSpy() {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]:not([href="#"]):not([role="tab"])'))
    .map((link) => ({ link, target: document.getElementById(decodeURIComponent(link.hash.slice(1))) }))
    .filter((entry): entry is { link: HTMLAnchorElement; target: HTMLElement } => entry.target !== null);
  if (!links.length) return;

  // Links that point into the same list (e.g. the About C principles) are handled together.
  const groups = new Map<Element, typeof links>();
  for (const entry of links) {
    const group = entry.link.parentElement ?? document.body;
    groups.set(group, [...(groups.get(group) ?? []), entry]);
  }

  const update = () => {
    const middle = window.innerHeight / 2;
    for (const entries of groups.values()) {
      const boxes = entries.map(({ target }) => target.getBoundingClientRect());
      const first = boxes[0];
      const last = boxes[boxes.length - 1];
      let active = -1;
      if (first.top <= middle && last.bottom >= middle) {
        // The last section whose top has passed the middle of the screen.
        boxes.forEach((box, index) => {
          if (box.top <= middle) active = index;
        });
      }
      entries.forEach(({ link }, index) => {
        const current = index === active;
        link.classList.toggle('is-current', current);
        if (current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  };

  let frame = 0;
  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      update();
    });
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();
}
