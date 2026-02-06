declare module "drizzle-kit" {
  export interface Config {
    schema: string;
    out: string;
    driver: string;
    dbCredentials: Record<string, unknown>;
  }
  const config: any;
  export default config;
}

declare module "drizzle-orm/node-postgres" {
  export const drizzle: any;
}

declare module "drizzle-orm/pg-core" {
  export const pgTable: any;
  export const serial: any;
  export const text: any;
  export const integer: any;
  export const timestamp: any;
}
