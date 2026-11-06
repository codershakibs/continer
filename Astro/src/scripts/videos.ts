import { prefersMotion } from './gsap';

function initVideo(wrapper: HTMLElement) {
  const video = wrapper.querySelector('video');
  if (!video) return;
  const button = wrapper.querySelector<HTMLButtonElement>('[data-video-toggle]');
  const pauseIcon = button?.querySelector<HTMLElement>('[data-video-icon="pause"]');
  const playIcon = button?.querySelector<HTMLElement>('[data-video-icon="play"]');
  let pausedByUser = !prefersMotion();

  const sync = () => {
    if (!button || !pauseIcon || !playIcon) return;
    pauseIcon.hidden = video.paused;
    playIcon.hidden = !video.paused;
    button.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
  };

  const play = () => {
    video.play().catch(() => sync());
  };

  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);

  if (pausedByUser) {
    video.removeAttribute('autoplay');
    video.pause();
  }

  button?.addEventListener('click', () => {
    pausedByUser = !video.paused;
    if (video.paused) play();
    else video.pause();
  });

  // Save bandwidth and CPU on long pages: only play what is on screen.
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !pausedByUser) play();
    else if (!entry.isIntersecting) video.pause();
  }, { rootMargin: '200px' }).observe(wrapper);

  sync();
}

export function initVideos() {
  document.querySelectorAll<HTMLElement>('[data-video]').forEach(initVideo);
}
