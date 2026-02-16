// Cookie Banner Implementation
(function () {
  "use strict";

  // Check if user has already accepted cookies
  if (localStorage.getItem("cookiesAccepted") === "true") {
    return;
  }

  // Create cookie banner
  const banner = document.createElement("div");
  banner.id = "cookie-banner";
  banner.innerHTML = `
        <div style="
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #2c3e50;
            color: white;
            padding: 15px 20px;
            z-index: 10000;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.3);
            font-family: Arial, sans-serif;
            font-size: 14px;
            line-height: 1.4;
        ">
            <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
                <div style="flex: 1; min-width: 300px;">
                    <strong>🍪 We use cookies</strong><br>
                    This website uses cookies to enhance your experience and provide personalized services.
                    <a href="/cookies-policy.html" style="color: #3498db; text-decoration: underline;" target="_blank">Learn more about our cookie policy</a>
                </div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button id="accept-cookies" style="
                        background: #27ae60;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 14px;
                    ">Accept All</button>
                    <button id="decline-cookies" style="
                        background: transparent;
                        color: white;
                        border: 1px solid white;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Decline</button>
                </div>
            </div>
        </div>
    `;

  // Add banner to page
  document.body.appendChild(banner);

  // Handle accept button
  document
    .getElementById("accept-cookies")
    .addEventListener("click", function () {
      localStorage.setItem("cookiesAccepted", "true");
      localStorage.setItem(
        "cookiePreferences",
        JSON.stringify({
          necessary: true,
          functional: true,
          analytics: true,
          advertising: true,
        }),
      );
      banner.remove();

      // Initialize analytics and other tracking
      initializeTracking();
    });

  // Handle decline button
  document
    .getElementById("decline-cookies")
    .addEventListener("click", function () {
      localStorage.setItem("cookiesAccepted", "false");
      localStorage.setItem(
        "cookiePreferences",
        JSON.stringify({
          necessary: true,
          functional: false,
          analytics: false,
          advertising: false,
        }),
      );
      banner.remove();
    });

  // Initialize tracking if cookies are accepted
  function initializeTracking() {
    // Add Google Analytics or other tracking code here
    console.log("Tracking initialized - cookies accepted");

    // Example: Google Analytics
    // gtag('config', 'GA_MEASUREMENT_ID');

    // Example: Facebook Pixel
    // fbq('track', 'PageView');
  }
})();
