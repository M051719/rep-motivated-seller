import { DatabasePool } from "../src/lib/database/connection-pool.js";

function getArgValue(flag: string): string | undefined {
    const idx = process.argv.indexOf(flag);
    if (idx === -1) return undefined;
    return process.argv[idx + 1];
}

function sslForUrl(url: string) {
    if (url.includes("sslmode=require")) return { rejectUnauthorized: false };
    return undefined;
}

async function main() {
    const overrideUrl = getArgValue("--url");
    const url = overrideUrl ?? process.env.DATABASE_URL;

    if (!url) {
        console.error("❌ DATABASE_URL is not set and no --url provided");
        process.exit(1);
    }

    DatabasePool.init({
        connectionString: url,
        ssl: sslForUrl(url),
        connectionTimeoutMillis: 10_000,
        idleTimeoutMillis: 30_000,
        statement_timeout: 10_000,
        query_timeout: 10_000,
        max: 5,
    });

    try {
        const res = await DatabasePool.getInstance().query(
            "select 1 as ok, current_database() as db, current_user as user, now() as now;",
        );
        console.log("✅ DB ping OK:", res.rows?.[0]);
        process.exit(0);
    } catch (err) {
        console.error("❌ DB ping FAILED:", err);
        process.exit(1);
    } finally {
        await DatabasePool.reset();
    }
}

main().catch((err) => {
    console.error("❌ Unexpected failure:", err);
    process.exit(1);
});
