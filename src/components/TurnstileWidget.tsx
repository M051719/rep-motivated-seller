import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { logAuthEvent } from "../utils/authTelemetry";

export interface TurnstileWidgetHandle {
  reset: () => void;
  forceVisible: () => void;
}

interface TurnstileWidgetProps {
  onToken: (token: string | null) => void;
  fallbackThreshold?: number;
  siteKey?: string;
}

const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  (
    {
      onToken,
      fallbackThreshold = 1,
      siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY,
    },
    ref,
  ) => {
    const [errorCount, setErrorCount] = useState(0);
    const [forceVisible, setForceVisible] = useState(true); // start visible to avoid “complete captcha” with no widget
    const instanceRef = useRef<TurnstileInstance>(null);

    useImperativeHandle(ref, () => ({
      reset: () => instanceRef.current?.reset(),
      forceVisible: () => setForceVisible(true),
    }));

    if (!siteKey) {
      console.warn("Turnstile site key missing; skipping challenge");
      return null;
    }

    const mode =
      forceVisible || errorCount >= fallbackThreshold ? "visible" : "invisible";

    const handleVerify = (token: string) => {
      onToken(token);
      setErrorCount(0);
      setForceVisible(false);
      logAuthEvent("turnstile_verified", { mode });
    };

    const handleExpire = () => {
      onToken(null);
      instanceRef.current?.reset();
      logAuthEvent("turnstile_expired", { mode });
    };

    const handleError = () => {
      onToken(null);
      setErrorCount((count) => {
        const next = count + 1;
        if (next >= fallbackThreshold) {
          setForceVisible(true);
        }
        return next;
      });
      instanceRef.current?.reset();
      logAuthEvent("turnstile_error", { mode });
    };

    return (
      <Turnstile
        ref={instanceRef}
        sitekey={siteKey}
        options={{
          size: mode === "visible" ? "normal" : "invisible",
          retry: "auto",
          retryInterval: 1500,
        }}
        onVerify={handleVerify}
        onExpire={handleExpire}
        onError={handleError}
      />
    );
  },
);

TurnstileWidget.displayName = "TurnstileWidget";

export default TurnstileWidget;
