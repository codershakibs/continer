import { gsap, ScrollTrigger, SplitText, prefersMotion } from './gsap';

type SplitType = 'lines' | 'chars';

interface Preset {
  from: gsap.TweenVars;
  /** Position in the page-load timeline, in seconds. */
  at?: number;
  duration?: number;
  ease?: string;
  stagger?: number | gsap.StaggerVars;
  split?: SplitType;
  /** Animate the element's direct children instead of the element. */
  children?: boolean;
  /** ScrollTrigger start position. */
  start?: string;
}

const fadeUp = (y: number | string, scale?: number): gsap.TweenVars => ({ autoAlpha: 0, y, ...(scale ? { scale } : {}) });
const lines = (at: number, y: number | string = '100%'): Preset => ({ from: fadeUp(y), at, split: 'lines', stagger: 0.03 });

/** Entrance timelines that play once on page load, keyed by `data-anim` token. */
const LOAD: Record<string, Preset> = {
  'Nav.Bar': { from: { autoAlpha: 0, yPercent: -100 }, at: 0 },
  'Home.Tag': { from: fadeUp(30, 0.96), at: 0 },
  'Home.Tag-One': { from: fadeUp(30, 0.96), at: 0 },
  'Home.Title': lines(0.4),
  'Home.Text': lines(0.8),
  'Home.Button': { from: fadeUp(30, 0.96), at: 1 },
  'Home.Author': { from: { autoAlpha: 0, x: 30 }, at: 1.2 },
  'Home.Logo': { from: { autoAlpha: 0, x: -30 }, at: 1.6 },
  'Home.Counter-One': { from: fadeUp(30), at: 1 },
  'Home.Counter-Two': { from: fadeUp(30), at: 1.2 },
  'Home.Counter-Three': { from: fadeUp(30), at: 1.4 },
  'Home.Text-Two': { from: fadeUp(30), at: 2.4 },
  'Home.Video': { from: { scale: 1.2 }, at: 0, duration: 1.8 },
  'Avater.01': { from: { autoAlpha: 0, x: 30 }, at: 1.6 },
  'Avater.02': { from: { autoAlpha: 0, x: 30 }, at: 1.8 },
  'Avater.03': { from: { autoAlpha: 0, x: 30 }, at: 2 },
  'Avater.04': { from: { autoAlpha: 0, x: 30 }, at: 2.2 },
  'About.Tag': { from: fadeUp(20, 0.94), at: 0 },
  'About.Title': lines(0.4),
  'About.Text': lines(0.6),
  'About.Button': { from: fadeUp(20, 0.94), at: 1 },
  'About.Video': { from: { scale: 1.2 }, at: 0, duration: 1.8 },
  'Faq.Tag': { from: fadeUp(20, 0.9), at: 0.8 },
  'Faq.Question': { from: fadeUp(20, 0.96), at: 1, stagger: 0.12 },
  'Contact.Tag': { from: fadeUp('100%', 0.96), at: 0 },
  'Contact.Title': { from: { autoAlpha: 0, x: 10, scale: 1.1 }, at: 0.2, split: 'chars', stagger: 0.03 },
  'Contact.Text': lines(0.5),
  'Contact.Card01': { from: fadeUp(30), at: 0.7 },
  'Contact.Card02': { from: fadeUp(30), at: 0.9 },
  'Contact.Toggle0': { from: fadeUp(30), at: 1.1 },
  'Contact.Toggle1': { from: fadeUp(30), at: 1.3 },
  'Contact.Toggle2': { from: fadeUp(30), at: 1.5 },
  'Contact.Toggle3': { from: fadeUp(30), at: 1.7 },
  'Contact.Video': { from: { scale: 1.2 }, at: 0, duration: 1.8 },
  'Case.Tag': { from: fadeUp(30, 0.96), at: 0 },
  'Case.Title': lines(0.2),
  'Case.Card': { from: fadeUp(60, 0.9), at: 0.7 },
  'Blogs.Tag': { from: fadeUp(30, 0.96), at: 0 },
  'Blogs.Title': lines(0.5),
  'Blogs.Text': { from: fadeUp(30), at: 1 },
  'Blogs.Card': { from: fadeUp(60, 0.9), at: 0.6, duration: 1.5 },
  'Privacy.Tag': { from: fadeUp(30, 0.96), at: 0 },
  'Privacy.Title': { from: { autoAlpha: 0, x: 10 }, at: 0.2, split: 'chars', stagger: 0.03 },
  'Privacy.Text': lines(0.6, 30),
  'Privacy.Text-2': { from: fadeUp(30), at: 1 },
  'Privacy.Text-3': { from: fadeUp(30), at: 1.2 },
  'Privacy.Text-4': { from: fadeUp(30), at: 1.6 },
  'Privacy.Text-5': { from: fadeUp(30), at: 2 },
};

/** Reveals that play once when the element scrolls into view. */
const SCROLL: Record<string, Preset> = {
  'Sub.Tag': { from: fadeUp('100%', 0.95) },
  'Sub.Title': { from: fadeUp('100%'), split: 'chars', stagger: { amount: 1 }, ease: 'power3.out' },
  'Loading.Text': { from: fadeUp('100%'), split: 'lines', stagger: 0.03 },
  /** Large intro headings: lines rise through a mask one after another. */
  'Heading.Lines': { from: fadeUp('100%'), split: 'lines', stagger: 0.1, ease: 'power2.out', start: 'top 90%' },
  'Loading.Card': { from: { y: 60, scale: 0.8 }, duration: 1 },
  'Card.Animation': { from: fadeUp(24), duration: 0.6, start: 'top bottom' },
  items: { from: fadeUp(60), stagger: 0.15, children: true },
  slideup: { from: fadeUp(50), stagger: 0.15, children: true },
  group: { from: fadeUp(100), start: 'top bottom' },
  'group-children': { from: fadeUp(50), stagger: 0.15, children: true, start: 'top bottom' },
};

// GSAP writes into the vars objects it receives (gsap.set adds `duration: 0`), so presets are
// always passed as copies, and only these animated properties are reset in the end state.
const NEUTRAL: gsap.TweenVars = { autoAlpha: 1, x: 0, y: 0, xPercent: 0, yPercent: 0, scale: 1 };

function toVars(from: gsap.TweenVars, preset: Preset): gsap.TweenVars {
  const to: gsap.TweenVars = {
    duration: preset.duration ?? 0.5,
    ease: preset.ease ?? 'power3.out',
    stagger: preset.stagger,
  };
  for (const key of Object.keys(from)) if (key in NEUTRAL) to[key] = NEUTRAL[key];
  return to;
}

const select = (token: string) => gsap.utils.toArray<HTMLElement>(`[data-anim~="${token}"]`);

/**
 * Inserts a line break wherever the text currently wraps and turns off other wrapping,
 * so the text keeps exactly these lines while it is split. Returns a function that undoes it.
 */
function pinLineBreaks(el: HTMLElement) {
  // Read the width before changing anything: once breaks are inserted, a box sized by its
  // content would already have shrunk to the longest line. Computed style ignores transforms.
  const width = getComputedStyle(el).width;
  const range = document.createRange();
  const cuts: { node: Text; index: number }[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let previousTop: number | null = null;
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    const words = node.data.matchAll(/\S+/g);
    for (const word of words) {
      const index = word.index ?? 0;
      range.setStart(node, index);
      range.setEnd(node, index + 1);
      const top = range.getBoundingClientRect().top;
      // A word that starts lower than the previous one starts a new line.
      if (previousTop !== null && top > previousTop + 2) cuts.push({ node, index });
      previousTop = top;
    }
  }

  // Insert from the end so earlier offsets stay valid.
  for (const { node, index } of cuts.reverse()) {
    const br = document.createElement('br');
    br.dataset.pinnedBreak = '';
    node.parentNode?.insertBefore(br, node.splitText(index));
  }
  // Keep the box at its original width, so centered text doesn't move.
  const inline = { whiteSpace: el.style.whiteSpace, width: el.style.width };
  el.style.width = width;
  el.style.whiteSpace = 'nowrap';

  return () => {
    el.querySelectorAll('br[data-pinned-break]').forEach((br) => br.remove());
    el.normalize();
    el.style.whiteSpace = inline.whiteSpace;
    el.style.width = inline.width;
  };
}

/** Splits text, plays through `add`, and restores the original markup so lines reflow on resize. */
function splitTargets(el: HTMLElement, type: SplitType) {
  gsap.set(el, { autoAlpha: 1 });
  if (type === 'chars') {
    // Split characters become separate boxes, so the browser could wrap the text at different
    // points while it is split, and the heading would jump when the split is removed.
    // Read where each line breaks in the untouched text, pin those breaks, and stop any other
    // wrapping while split. The lines then match the final layout exactly.
    const unpin = pinLineBreaks(el);
    const split = SplitText.create(el, { type: 'words,chars', mask: 'chars' });
    return {
      targets: split.chars as Element[],
      revert: () => {
        split.revert();
        unpin();
      },
    };
  }
  const split = SplitText.create(el, { type, mask: type });
  return { targets: split[type] as Element[], revert: () => split.revert() };
}

function playLoad() {
  const timeline = gsap.timeline();
  for (const [token, preset] of Object.entries(LOAD)) {
    for (const el of select(token)) {
      const at = preset.at ?? 0;
      if (preset.split) {
        const { targets, revert } = splitTargets(el, preset.split);
        timeline.fromTo(targets, { ...preset.from }, { ...toVars(preset.from, preset), onComplete: revert }, at);
      } else {
        if (!('autoAlpha' in preset.from)) gsap.set(el, { autoAlpha: 1 });
        timeline.fromTo(el, { ...preset.from }, { ...toVars(preset.from, preset), clearProps: 'transform,opacity,visibility' }, at);
      }
    }
  }
}

function setupReveal(token: string, preset: Preset) {
  for (const el of select(token)) {
    const targets = preset.children ? (Array.from(el.children) as HTMLElement[]) : [el];
    if (!targets.length) continue;
    if (preset.split) {
      gsap.set(el, { autoAlpha: 0 });
    } else {
      if (preset.children) gsap.set(el, { autoAlpha: 1 });
      if (!('autoAlpha' in preset.from)) gsap.set(targets, { autoAlpha: 1 });
      gsap.set(targets, { ...preset.from });
    }
    ScrollTrigger.create({
      trigger: el,
      start: preset.start ?? 'top 80%',
      once: true,
      onEnter: () => {
        if (preset.split) {
          const { targets: parts, revert } = splitTargets(el, preset.split);
          gsap.fromTo(parts, { ...preset.from }, { ...toVars(preset.from, preset), onComplete: revert });
        } else {
          gsap.to(targets, { ...toVars(preset.from, preset), clearProps: 'transform,opacity,visibility' });
        }
      },
    });
  }
}

function setupCounters() {
  const pairs = gsap.utils.toArray<HTMLElement>('.counter-number._01');
  const seconds = gsap.utils.toArray<HTMLElement>('.counter-number._02');
  if (!pairs.length) return;
  if (!prefersMotion()) {
    gsap.set(seconds, { yPercent: -90 });
    return;
  }
  gsap.set(pairs, { yPercent: -90 });
  for (const el of pairs) {
    const wrap = el.closest('.counter-number-col-wrap') ?? el;
    const second = wrap.querySelectorAll('.counter-number._02');
    gsap.timeline({ scrollTrigger: { trigger: wrap, start: 'top 90%', once: true } })
      .to(el, { yPercent: 0, duration: 2.4, ease: 'power3.inOut' }, 0)
      .to(second, { yPercent: -90, duration: 2.4, ease: 'power3.inOut' }, 0);
  }
}

function setupOverlayGrids() {
  for (const grid of gsap.utils.toArray<HTMLElement>('.overlay-grid')) {
    const columns = grid.querySelectorAll('.col');
    gsap.fromTo(columns, { width: '100%', height: '100%' }, {
      height: '0%',
      duration: 1,
      ease: 'power3.inOut',
      stagger: { amount: 1 },
      scrollTrigger: { trigger: grid, start: 'top bottom', once: true },
    });
  }
}

/**
 * About B "Who we are" timeline: the red line fills as the section is scrolled and each step's
 * marker turns red as the line reaches it, reversing on the way back up. Keyframes are the
 * original interaction's, as percentages of the scroll range.
 */
function setupStepTimelines() {
  const styles = getComputedStyle(document.documentElement);
  const red = styles.getPropertyValue('--coral-red-color').trim();
  const gray = styles.getPropertyValue('--silver-gray-color').trim();

  for (const wrap of gsap.utils.toArray<HTMLElement>('.award-fil-wrap')) {
    const fill = wrap.querySelector('.awar-fil.brand-color');
    const markers = Array.from(wrap.querySelectorAll('.award-fil-bg'));
    if (!fill) continue;

    gsap.set(fill, { height: '0%' });
    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: wrap,
        start: 'top bottom',
        end: 'bottom 19%',
        // Scroll-linked, so it follows the user; smoothing only when motion is welcome.
        scrub: prefersMotion() ? 0.6 : true,
      },
    });
    timeline.to(fill, { height: '100%', duration: 96 }, 0);
    // Marker n turns red between 18·(n) % and 18·(n + 1) % of the way; the first starts red.
    markers.slice(1).forEach((marker, index) => {
      timeline.fromTo(marker, { color: gray }, { color: red, duration: 18 }, 18 * (index + 1));
    });
    timeline.to({}, { duration: 100 - timeline.duration() });
  }
}

/**
 * Scroll positions are measured once, but the page keeps growing as lazy images load.
 * Re-measure whenever the page height changes, so reveals and scrubbed timelines start
 * where the content actually is.
 */
function refreshOnLayoutChange() {
  let timer: number | undefined;
  let lastHeight = document.body.scrollHeight;
  new ResizeObserver(() => {
    const height = document.body.scrollHeight;
    if (Math.abs(height - lastHeight) < 2) return;
    lastHeight = height;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
  }).observe(document.body);
}

export function initScrollAnimations() {
  setupCounters();
  setupStepTimelines();
  refreshOnLayoutChange();
  if (!prefersMotion()) return;

  const start = () => {
    setupOverlayGrids();
    for (const [token, preset] of Object.entries(SCROLL)) setupReveal(token, preset);
    playLoad();
    document.documentElement.classList.add('anim-ready');
    ScrollTrigger.refresh();
  };

  // SplitText measures lines, so wait for webfonts but never hold the page for long.
  Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 800))]).then(start);
}
