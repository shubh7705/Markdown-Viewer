import { useState, useEffect } from 'react';

export function useScrollSpy(headingIds: string[]): string {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headingIds.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Find visible headings
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Pick the topmost intersecting heading
          const topVisible = visibleEntries.reduce((prev, current) =>
            prev.boundingClientRect.top < current.boundingClientRect.top ? prev : current
          );
          setActiveId(topVisible.target.id);
        }
      },
      {
        rootMargin: '-56px 0px -70% 0px',
        threshold: [0, 1.0],
      }
    );

    const elements: HTMLElement[] = [];
    headingIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
        elements.push(el);
      }
    });

    // Fallback: update on scroll if near bottom of document
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50) {
        if (headingIds.length > 0) {
          setActiveId(headingIds[headingIds.length - 1]);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [headingIds]);

  return headingIds.length === 0 ? '' : activeId;
}
