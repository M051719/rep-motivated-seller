import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, calendly-webhook-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function hmacSha256Hex(key: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(data));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function parseSignatureHeader(header: string | null) {
  if (!header) return { t: "", signature: "" };
  return header.split(",").reduce(
    (acc, current) => {
      const [k, v] = current.split("=");
      if (k === "t") acc.t = v;
      if (k === "v1") acc.signature = v;
      return acc;
    },
    { t: "", signature: "" },
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  const signingKey = Deno.env.get("CALENDLY_WEBHOOK_SECRET") || "";
  const toleranceMs = 3 * 60 * 1000; // 3 minutes

  try {
    const signatureHeader = req.headers.get("calendly-webhook-signature");
    const { t, signature } = parseSignatureHeader(signatureHeader);

    if (!signingKey || !t || !signature) {
      return new Response("Invalid signature header", { status: 401, headers: corsHeaders });
    }

    const timestampMs = Number(t) * 1000;
    const now = Date.now();
    if (Number.isNaN(timestampMs) || timestampMs < now - toleranceMs || timestampMs > now + toleranceMs) {
      return new Response("Signature timestamp outside tolerance", { status: 401, headers: corsHeaders });
    }

    const rawBody = await req.text();
    const signedPayload = `${t}.${rawBody}`;
    const expected = await hmacSha256Hex(signingKey, signedPayload);

    if (expected !== signature) {
      return new Response("Signature mismatch", { status: 401, headers: corsHeaders });
    }

    const json = rawBody ? JSON.parse(rawBody) : {};
    const event = json.event || json.event_type || "unknown";

    // TODO: persist or fan out event handling as needed

    return new Response(
      JSON.stringify({ ok: true, event }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Calendly webhook error", error);
    return new Response("Internal Server Error", { status: 500, headers: corsHeaders });
  }
});
