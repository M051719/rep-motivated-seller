// A unified Edge Function to audit, consolidate, and fix RLS policies across schemas.
// Routes:
//  - POST /policy-manager/audit
//  - POST /policy-manager/consolidate
//  - POST /policy-manager/fix
//
// Auth:
//  - Uses SUPABASE_DB_URL to connect directly to Postgres (privileged). Keep this function protected.
//
// Input JSON:
//  {
//    action: "audit" | "consolidate" | "fix", // optional when using route-specific paths
//    schemas?: string[]; // default ["public"] if not provided
//    dryRun?: boolean; // default true for consolidate/fix
//    options?: {
//      tableFilter?: string[]; // limit to specific tables (schema-qualified or not)
//      renamePolicyPrefix?: string; // default "RLS"
//      normalizeNaming?: boolean; // default true
//    }
//  }
//
// Responses:
//  - audit: { summary, tables, policies }
//  - consolidate/fix: { dryRun: boolean, statements: string[], executed: number }

import { Hono } from "npm:hono@4.4.7";
import { Pool } from "npm:pg@8.11.3";

// Minimal validator
function asArray(input: unknown): string[] | undefined {
  if (!input) return undefined;
  if (Array.isArray(input)) return input.map(String);
  return [String(input)];
}

const DEFAULT_SCHEMAS = ["public"];

// Ensure single shared pool
const pool = new Pool({
  connectionString: Deno.env.get("SUPABASE_DB_URL")!,
  max: 2,
});

// Helpers
async function withClient<T>(fn: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

function parseTableFilter(
  filter?: string[],
): { schema?: string; table?: string }[] | undefined {
  if (!filter || filter.length === 0) return undefined;
  return filter.map((f) => {
    const parts = f.split(".");
    if (parts.length === 2) return { schema: parts[0], table: parts[1] };
    return { table: parts[0] };
  });
}

function buildTablePredicate(
  schemas: string[],
  filters?: { schema?: string; table?: string }[],
): { sql: string; params: any[] } {
  const params: any[] = [];
  let where = `n.nspname = ANY($1)`;
  params.push(schemas);
  if (filters && filters.length > 0) {
    const clauses: string[] = [];
    filters.forEach((f) => {
      if (f.schema && f.table) {
        params.push(f.schema, f.table);
        clauses.push(
          `(n.nspname = $${params.length - 1} AND c.relname = $${params.length})`,
        );
      } else if (f.table) {
        params.push(f.table);
        clauses.push(`(c.relname = $${params.length})`);
      }
    });
    if (clauses.length) where += ` AND (` + clauses.join(" OR ") + `)`;
  }
  return { sql: where, params };
}

async function auditPolicies(input: {
  schemas: string[];
  tableFilter?: string[];
}) {
  const filters = parseTableFilter(input.tableFilter);
  const predicate = buildTablePredicate(input.schemas, filters);
  return await withClient(async (client) => {
    const tables = (
      await client.query(
        `select n.nspname as schema, c.relname as table, c.relrowsecurity as rls_enabled
         from pg_class c
         join pg_namespace n on n.oid = c.relnamespace
         where c.relkind = 'r' and ${predicate.sql}
         order by 1,2;`,
        predicate.params,
      )
    ).rows;

    const policies = (
      await client.query(
        `select pol.schemaname as schema,
                pol.tablename as table,
                pol.policyname as policy,
                pol.cmd as command,
                pol.roles as roles,
                pol.qual as using_expr,
                pol.with_check as with_check_expr
         from pg_policies pol
         join pg_class c on c.relname = pol.tablename
         join pg_namespace n on n.oid = c.relnamespace and n.nspname = pol.schemaname
         where ${predicate.sql}
         order by 1,2,3;`,
        predicate.params,
      )
    ).rows;

    // Heuristics for suspicious policies
    const suspicious: {
      schema: string;
      table: string;
      policy: string;
      issue: string;
    }[] = [];
    for (const p of policies) {
      if (!p.roles || p.roles.length === 0) {
        suspicious.push({
          schema: p.schema,
          table: p.table,
          policy: p.policy,
          issue: "Missing TO roles (roles is empty)",
        });
      }
      if (p.command === "SELECT" && !p.using_expr) {
        suspicious.push({
          schema: p.schema,
          table: p.table,
          policy: p.policy,
          issue: "SELECT policy missing USING expression",
        });
      }
      if (p.command === "INSERT" && !p.with_check_expr) {
        suspicious.push({
          schema: p.schema,
          table: p.table,
          policy: p.policy,
          issue: "INSERT policy missing WITH CHECK expression",
        });
      }
      if (p.command === "UPDATE" && (!p.using_expr || !p.with_check_expr)) {
        if (!p.using_expr)
          suspicious.push({
            schema: p.schema,
            table: p.table,
            policy: p.policy,
            issue: "UPDATE policy missing USING expression",
          });
        if (!p.with_check_expr)
          suspicious.push({
            schema: p.schema,
            table: p.table,
            policy: p.policy,
            issue: "UPDATE policy missing WITH CHECK expression",
          });
      }
      if (p.command === "DELETE" && !p.using_expr) {
        suspicious.push({
          schema: p.schema,
          table: p.table,
          policy: p.policy,
          issue: "DELETE policy missing USING expression",
        });
      }
      // Prefer auth.uid() usage
      const text = `${p.using_expr ?? ""} ${p.with_check_expr ?? ""}`;
      if (/current_user\b/i.test(text)) {
        suspicious.push({
          schema: p.schema,
          table: p.table,
          policy: p.policy,
          issue: "Uses current_user; prefer auth.uid()",
        });
      }
    }

    const summary = {
      schemas: input.schemas,
      table_count: tables.length,
      rls_enabled: tables.filter((t: any) => t.rls_enabled).length,
      rls_disabled: tables.filter((t: any) => !t.rls_enabled).length,
      policy_count: policies.length,
      suspicious_count: suspicious.length,
    };

    return { summary, tables, policies, suspicious };
  });
}

function normalizePolicyName(command: string, base: string, prefix: string) {
  // e.g., RLS Select by user_id
  const verb = command.charAt(0) + command.slice(1).toLowerCase();
  return `${prefix} ${verb} ${base}`.trim();
}

function buildConsolidationStatements(
  rows: any[],
  options: { renamePolicyPrefix: string; normalizeNaming: boolean },
) {
  const statements: string[] = [];
  // Group by table+command and attempt to merge duplicate policies with identical expressions and roles
  const key = (r: any) =>
    `${r.schema}.${r.table}|${r.command}|${r.using_expr ?? ""}|${r.with_check_expr ?? ""}|${(r.roles || []).join(",")}`;
  const groups = new Map<string, any[]>();
  for (const r of rows) {
    const k = key(r);
    groups.set(k, [...(groups.get(k) || []), r]);
  }
  for (const [, list] of groups) {
    if (list.length <= 1) continue;
    // Keep the first policy, drop the rest
    const keep = list[0];
    for (let i = 1; i < list.length; i++) {
      const drop = list[i];
      statements.push(
        `drop policy "${drop.policy.replace(/"/g, '""')}" on "${drop.schema}"."${drop.table}";`,
      );
    }
    // Optionally normalize name of kept policy
    if (options.normalizeNaming) {
      const base =
        keep.using_expr?.includes("auth.uid()") ||
        keep.with_check_expr?.includes("auth.uid()")
          ? "by auth.uid()"
          : "policy";
      const desired = normalizePolicyName(
        keep.command,
        base,
        options.renamePolicyPrefix,
      );
      if (desired !== keep.policy) {
        statements.push(
          `alter policy "${keep.policy.replace(/"/g, '""')}" on "${keep.schema}"."${keep.table}" rename to "${desired.replace(/"/g, '""')}";`,
        );
      }
    }
  }
  return statements;
}

function buildFixStatements(rows: any[]) {
  const statements: string[] = [];
  for (const p of rows) {
    // Missing roles -> default to authenticated
    if (!p.roles || p.roles.length === 0) {
      statements.push(
        `alter policy "${p.policy.replace(/"/g, '""')}" on "${p.schema}"."${p.table}" to authenticated;`,
      );
    }
    // Wrong function usage
    const text = `${p.using_expr ?? ""} ${p.with_check_expr ?? ""}`;
    if (/current_user\b/i.test(text)) {
      // Propose replacement. Exact rewrite is app-specific; we only comment via SQL
      statements.push(
        `-- Review policy "${p.policy}" on ${p.schema}.${p.table}: replace current_user with (select auth.uid())`,
      );
    }
    // Missing expressions per command
    if (p.command === "SELECT" && !p.using_expr) {
      statements.push(
        `-- Consider: create a restrictive SELECT policy or add USING expression on ${p.schema}.${p.table}`,
      );
    }
    if (p.command === "INSERT" && !p.with_check_expr) {
      statements.push(
        `-- Consider: add WITH CHECK expression for INSERT on ${p.schema}.${p.table}`,
      );
    }
    if (p.command === "UPDATE") {
      if (!p.using_expr)
        statements.push(
          `-- Consider: add USING expression for UPDATE on ${p.schema}.${p.table}`,
        );
      if (!p.with_check_expr)
        statements.push(
          `-- Consider: add WITH CHECK expression for UPDATE on ${p.schema}.${p.table}`,
        );
    }
    if (p.command === "DELETE" && !p.using_expr) {
      statements.push(
        `-- Consider: add USING expression for DELETE on ${p.schema}.${p.table}`,
      );
    }
  }
  return statements;
}

async function collectPoliciesForWork(
  client: any,
  schemas: string[],
  tableFilter?: string[],
) {
  const filters = parseTableFilter(tableFilter);
  const predicate = buildTablePredicate(schemas, filters);
  const { rows } = await client.query(
    `select pol.schemaname as schema,
            pol.tablename as table,
            pol.policyname as policy,
            pol.cmd as command,
            pol.roles as roles,
            pol.qual as using_expr,
            pol.with_check as with_check_expr
     from pg_policies pol
     join pg_class c on c.relname = pol.tablename
     join pg_namespace n on n.oid = c.relnamespace and n.nspname = pol.schemaname
     where ${predicate.sql}
     order by 1,2,3;`,
    predicate.params,
  );
  return rows;
}

async function runStatements(client: any, statements: string[]) {
  await client.query("begin;");
  try {
    for (const sql of statements) {
      await client.query(sql);
    }
    await client.query("commit;");
    return { executed: statements.length };
  } catch (e) {
    await client.query("rollback;");
    throw e;
  }
}

const app = new Hono();

app.use("*", async (c, next) => {
  // Simple protection: require an admin secret header for mutating actions
  // Set POLICY_MANAGER_SECRET via `supabase secrets set`
  const url = new URL(c.req.url);
  const isReadOnly = c.req.method === "GET" || url.pathname.endsWith("/audit");
  if (!isReadOnly) {
    const provided = c.req.header("x-policy-manager-secret");
    const expected = Deno.env.get("POLICY_MANAGER_SECRET");
    if (!expected || provided !== expected) {
      return c.json({ error: "Unauthorized" }, 401);
    }
  }
  await next();
});

app.post("/policy-manager/audit", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const schemas = asArray(body.schemas) ?? DEFAULT_SCHEMAS;
  const tableFilter = asArray(body?.options?.tableFilter);
  const data = await auditPolicies({ schemas, tableFilter });
  return c.json(data);
});

app.post("/policy-manager/consolidate", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const schemas = asArray(body.schemas) ?? DEFAULT_SCHEMAS;
  const tableFilter = asArray(body?.options?.tableFilter);
  const renamePolicyPrefix = String(body?.options?.renamePolicyPrefix ?? "RLS");
  const normalizeNaming = body?.options?.normalizeNaming ?? true;
  const dryRun = body?.dryRun ?? true;

  return await withClient(async (client) => {
    const rows = await collectPoliciesForWork(client, schemas, tableFilter);
    const statements = buildConsolidationStatements(rows, {
      renamePolicyPrefix,
      normalizeNaming,
    });
    if (dryRun || statements.length === 0)
      return c.json({ dryRun: true, statements, executed: 0 });
    const res = await runStatements(client, statements);
    return c.json({ dryRun: false, statements, executed: res.executed });
  });
});

app.post("/policy-manager/fix", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const schemas = asArray(body.schemas) ?? DEFAULT_SCHEMAS;
  const tableFilter = asArray(body?.options?.tableFilter);
  const dryRun = body?.dryRun ?? true;

  return await withClient(async (client) => {
    const rows = await collectPoliciesForWork(client, schemas, tableFilter);
    const statements = buildFixStatements(rows);
    if (dryRun || statements.length === 0)
      return c.json({ dryRun: true, statements, executed: 0 });
    const res = await runStatements(client, statements);
    return c.json({ dryRun: false, statements, executed: res.executed });
  });
});

app.get("/policy-manager/health", (c) => c.json({ ok: true }));

Deno.serve(app.fetch);
