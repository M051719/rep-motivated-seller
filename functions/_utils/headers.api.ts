/**
 * Content Security Policy for RepMotivatedSeller API responses
 */
export const CSP =
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://*.cloudflare.com https://js.stripe.com https://*.stripe.com https://m.stripe.network https://assets.calendly.com https://api.dappier.com https://ltxqodqlexvojqqxquew.supabase.co; " +
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.mapbox.com https://assets.calendly.com https://m.stripe.network; " +
  "font-src 'self' https://fonts.gstatic.com; " +
  "img-src 'self' data: https: blob:; " +
  "media-src 'self' data: blob: https:; " +
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mapbox.com https://events.mapbox.com https://api.stripe.com https://m.stripe.network https://calendly.com https://*.calendly.com https://www.googleapis.com https://api.dappier.com https://ltxqodqlexvojqqxquew.supabase.co; " +
  "frame-src 'self' https://challenges.cloudflare.com https://calendly.com https://*.calendly.com https://js.stripe.com https://m.stripe.network https://www.youtube.com https://youtube.com https://*.youtube.com; " +
  "worker-src 'self' blob:; " +
  "child-src 'self' blob:; " +
  "base-uri 'self'; " +
  "form-action 'self';";

/**
 * Standard security headers for API responses
 */
export const baseHeaders = {
  "Content-Security-Policy": CSP,
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(self), microphone=(), camera=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};

/**
 * Headers for JSON API responses
 */
export const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  ...baseHeaders,
};

/**
 * Headers for HTML responses (non-SSR)
 */
export const htmlHeaders = {
  "Content-Type": "text/html; charset=utf-8",
  ...baseHeaders,
};
