'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

const SCROLL_CONTAINER_ID = 'main-content';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = document.getElementById(SCROLL_CONTAINER_ID);
    if (!container) return;

    const onScroll = () => setVisible(container.scrollTop > 300);
    container.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // check initial scroll position (e.g. restored from history)
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    document.getElementById(SCROLL_CONTAINER_ID)?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed bottom-8 right-8 z-50 flex items-center justify-center w-11 h-11 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 ${
        visible ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-4 opacity-0 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
