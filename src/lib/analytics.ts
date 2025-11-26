// Analytics tracking functions for Google Analytics 4

export const trackPageView = (page: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: page,
    });
  }
  console.log('Page view tracked:', page);
};

export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
  console.log('Event tracked:', eventName, eventParams);
};

// Type definitions
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}