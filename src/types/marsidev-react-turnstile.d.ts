declare module "@marsidev/react-turnstile" {
  import * as React from "react";
  export interface TurnstileInstance {
    reset: () => void;
  }
  export interface TurnstileProps {
    ref?: React.Ref<TurnstileInstance>;
    sitekey: string;
    options?: Record<string, unknown>;
    onVerify?: (token: string) => void;
    onExpire?: () => void;
    onError?: () => void;
  }
  export const Turnstile: React.ForwardRefExoticComponent<
    TurnstileProps & React.RefAttributes<TurnstileInstance>
  >;
}
