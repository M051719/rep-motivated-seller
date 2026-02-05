type AuthEvent =
  | "turnstile_verified"
  | "turnstile_error"
  | "turnstile_expired"
  | "auth_submit"
  | "auth_success"
  | "auth_error";

interface AuthTelemetryPayload {
  [key: string]: unknown;
  event?: AuthEvent;
  timestamp?: string;
}

const TELEMETRY_ENDPOINT = import.meta.env.VITE_AUTH_TELEMETRY_URL;
const TELEMETRY_SECRET = import.meta.env.VITE_AUTH_TELEMETRY_SECRET;

export const logAuthEvent = (event: AuthEvent, payload: AuthTelemetryPayload = {}) => {
  const body = {
    event,
    timestamp: new Date().toISOString(),
    ...payload,
  } satisfies AuthTelemetryPayload;

  console.info("[auth]", event, body);

  try {
    if (!TELEMETRY_ENDPOINT || !TELEMETRY_SECRET) return;
    const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
    const hasNavigator = typeof navigator !== "undefined";

    if (hasNavigator && typeof navigator.sendBeacon === "function") {
      // sendBeacon does not allow custom headers; fall back to fetch when secret required
      fetch(TELEMETRY_ENDPOINT, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-auth-telemetry-secret": TELEMETRY_SECRET,
        },
        body: JSON.stringify(body),
        keepalive: true,
      }).catch(() => undefined);
    } else if (typeof fetch === "function") {
      fetch(TELEMETRY_ENDPOINT, {
        method: "POST",
        keepalive: true,
        headers: {
          "content-type": "application/json",
          "x-auth-telemetry-secret": TELEMETRY_SECRET,
        },
        body: JSON.stringify(body),
      }).catch(() => undefined);
    }
  } catch (error) {
    console.debug("[auth] telemetry skipped", error);
  }
};
