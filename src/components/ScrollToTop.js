"use client";

import { useEffect } from 'react';

export default function ScrollToTop({ targetId, behavior = 'smooth' } = {}) {
  useEffect(() => {
    try {
      // Scroll to top of document
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, left: 0, behavior });
      }

      // If a targetId is provided, focus it for accessibility
      if (targetId) {
        const el = document.getElementById(targetId);
        if (el) {
          // ensure element is focusable
          if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
          el.focus();
        }
      }
    } catch (err) {
      // ignore
    }
  }, [targetId]);

  return null;
}
