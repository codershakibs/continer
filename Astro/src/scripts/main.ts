import { initScrollAnimations } from './animations';
import { initCargoTabs } from './cargo-tabs';
import { initFaq } from './faq';
import { initForms } from './forms';
import { initHoverText } from './hover-text';
import { initNavigation } from './navigation';
import { initSliders } from './slider';
import { initSmoothScroll } from './smooth-scroll';
import { initTabs } from './tabs';
import { initVideos } from './videos';

initNavigation();
initFaq();
initTabs();
initCargoTabs();
initSliders();
initForms();
initVideos();

if (document.documentElement.classList.contains('has-motion')) {
  initSmoothScroll();
  initHoverText();
}

initScrollAnimations();
