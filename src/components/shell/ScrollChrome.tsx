'use client';

import { useEffect } from 'react';

export function ScrollChrome() {
  useEffect(() => {
    const scrollTimers = new WeakMap<EventTarget, number>();

    const onScroll = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      target.classList.add('is-scrolling');
      const pending = scrollTimers.get(target);
      if (pending) window.clearTimeout(pending);

      scrollTimers.set(
        target,
        window.setTimeout(() => {
          target.classList.remove('is-scrolling');
          scrollTimers.delete(target);
        }, 700)
      );
    };

    document.addEventListener('scroll', onScroll, true);
    return () => document.removeEventListener('scroll', onScroll, true);
  }, []);

  return null;
}
