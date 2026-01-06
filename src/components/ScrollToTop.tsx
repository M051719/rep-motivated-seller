import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component
 * Scrolls to top of page on route change and ensures body is scrollable
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Always ensure body is scrollable
    document.body.style.overflow = 'unset';
    document.documentElement.style.overflow = 'unset';

    // If there's a hash, let the browser handle it
    if (hash) {
      return;
    }

    // Otherwise scroll to top immediately
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    // Double-check scroll position after a brief delay
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 10);
  }, [pathname, hash]);

  return null;
}
