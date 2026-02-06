declare module "react-error-boundary" {
  import * as React from "react";
  export interface FallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
  }
  export const ErrorBoundary: React.FC<{ FallbackComponent: React.ComponentType<FallbackProps>; onError?: (error: Error, info: any) => void; onReset?: () => void }>;
}

declare module "@supabase/auth-helpers-nextjs" {
  export const createClientComponentClient: any;
  export const createMiddlewareClient: any;
}

declare module "@supabase/auth-helpers-react" {
  export const SessionContextProvider: any;
}

declare module "@supabase/edge-runtime" {
  export const createMiddleware: any;
}

declare module "next" {
  export interface NextApiRequest {}
  export interface NextApiResponse<T = any> {
    status: (code: number) => NextApiResponse<T>;
    json: (body: T) => NextApiResponse<T>;
  }
}

declare module "zod" {
  export const z: any;
}
