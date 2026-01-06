import { useEffect } from "react";

const SecurityHeaders: React.FC = () => {
  useEffect(() => {
    // Set security-related meta tags and headers where possible
    const setSecurityMeta = () => {
      // Content Security Policy (basic - enhance based on needs)
      const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.paypal.com https://assets.calendly.com https://connect.facebook.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://api.stripe.com https://api.paypal.com https://api.calendly.com https://graph.facebook.com https://ltxqodqlexvojqqxquew.supabase.co wss://ltxqodqlexvojqqxquew.supabase.co",
        "frame-src 'self' https://js.stripe.com https://www.paypal.com https://assets.calendly.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; ");

      // Remove existing CSP meta tag if present
      const existingCSP = document.querySelector(
        'meta[http-equiv="Content-Security-Policy"]',
      );
      if (existingCSP) {
        existingCSP.remove();
      }

      // Add CSP meta tag
      const cspMeta = document.createElement("meta");
      cspMeta.httpEquiv = "Content-Security-Policy";
      cspMeta.content = csp;
      document.head.appendChild(cspMeta);

      // Add other security meta tags
      const securityMetas = [
        { name: "referrer", content: "strict-origin-when-cross-origin" },
        { httpEquiv: "X-Content-Type-Options", content: "nosniff" },
        { httpEquiv: "X-Frame-Options", content: "DENY" },
        { httpEquiv: "X-XSS-Protection", content: "1; mode=block" },
        {
          httpEquiv: "Strict-Transport-Security",
          content: "max-age=31536000; includeSubDomains",
        },
        {
          httpEquiv: "Permissions-Policy",
          content: "camera=(), microphone=(), geolocation=(), payment=()",
        },
      ];

      securityMetas.forEach((meta) => {
        const existingMeta = document.querySelector(
          `meta[${meta.name ? "name" : "http-equiv"}="${meta.name || meta.httpEquiv}"]`,
        );
        if (existingMeta) {
          existingMeta.remove();
        }

        const metaTag = document.createElement("meta");
        if (meta.name) {
          metaTag.name = meta.name;
        } else {
          metaTag.httpEquiv = meta.httpEquiv!;
        }
        metaTag.content = meta.content;
        document.head.appendChild(metaTag);
      });
    };

    setSecurityMeta();
  }, []);

  return null; // This component doesn't render anything
};

export default SecurityHeaders;
