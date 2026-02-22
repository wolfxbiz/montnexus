import { useEffect, useRef } from 'react';

/**
 * Attaches a single IntersectionObserver to a container ref.
 * Any child with the 'reveal' class gets the 'visible' class
 * when it scrolls into view.
 *
 * Usage:
 *   const sectionRef = useScrollReveal();
 *   return <section ref={sectionRef}>...</section>
 */
export function useScrollReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const revealEls = container.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    );

    revealEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 100) {
        el.classList.add('visible');
      } else {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  return ref;
}
