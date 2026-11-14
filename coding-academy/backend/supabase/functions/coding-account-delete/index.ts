/**
 * LAMA Coding Academy — OPTIONAL self-service account erasure.
 * DRAFT ONLY: deploy in a DEDICATED Coding Academy Supabase project after security QA.
 *
 * Uses verified user access token + a fresh password check. Caller cannot choose
 * a target user id. Admin secret never reaches the browser. Deletes Auth user and
 * cascade-linked coding progress. Requires email/password identities.
 *
 * Enable platform JWT verification (default) and test with two separate accounts.
 * Never deploy this to the existing LAMA PPSC Academy project.
 */
import { createClient } from "npm:@supabase/supabase-js@2.119.0";

const allowedOrigins = new Set([
  "https://www.lamastudio.pk",
  "https://lamastudio.pk",
]);
const json = (body: Record<string, unknown>, status = 200, origin = "") =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(allowedOrigins.has(origin) ? { "access-control-allow-origin": origin, "vary": "Origin" } : {}),
    },
  });

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin") ?? "";
  if (origin && !allowedOrigins.has(origin)) {
    return json({ error: "Origin not allowed." }, 403);
  }
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": origin,
        "access-control-allow-methods": "DELETE, OPTIONS",
        "access-control-allow-headers": "authorization, apikey, content-type, x-client-info",
        "access-control-max-age": "600",
        "vary": "Origin",
        "cache-control": "no-store",
      },
    });
  }
  if (request.method !== "DELETE") return json({ error: "Use DELETE." }, 405, origin);

  const auth = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/.exec(auth);
  if (!match) return json({ error: "Sign in before requesting deletion." }, 401, origin);
  const token = match[1];

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > 2048) return json({ error: "Request is too large." }, 413, origin);

  let payload: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 2048) return json({ error: "Request is too large." }, 413, origin);
    const decoded = JSON.parse(raw);
    if (!decoded || typeof decoded !== "object" || Array.isArray(decoded)) {
      throw new Error("Invalid input");
    }
    payload = decoded;
  } catch {
    return json({ error: "Invalid request." }, 400, origin);
  }
  if (payload.confirmation !== "DELETE ACCOUNT" ||
      typeof payload.password !== "string" ||
      payload.password.length < 8 ||
      payload.password.length > 128 ||
      Object.keys(payload).some((key) => !["confirmation", "password"].includes(key))) {
    return json({ error: "Account deletion requires password and confirmation." }, 400, origin);
  }

  // Project settings and privileged keys are server-side ONLY.
  const url = Deno.env.get("SUPABASE_URL");
  let publishable = "";
  let secret = "";
  try {
    const pubs = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? "{}");
    const secrets = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
    publishable = typeof pubs.default === "string" ? pubs.default : "";
    secret = typeof secrets.default === "string" ? secrets.default : "";
  } catch {
    return json({ error: "Account deletion service is not configured." }, 503, origin);
  }
  if (!url || !publishable || !secret) {
    return json({ error: "Account deletion service is not configured." }, 503, origin);
  }

  try {
    const userClient = createClient(url, publishable, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: current, error: identityError } = await userClient.auth.getUser(token);
    const user = current?.user;
    if (identityError || !user?.id || !user.email) {
      return json({ error: "Your sign-in session is no longer valid." }, 401, origin);
    }

    // Password reauthentication is mandatory for this destructive operation.
    // A stolen JWT alone cannot request deletion. This flow is for password accounts.
    const { data: authenticated, error: passwordError } =
      await userClient.auth.signInWithPassword({
        email: user.email,
        password: payload.password,
      });
    if (passwordError || authenticated?.user?.id !== user.id) {
      return json({ error: "Password confirmation failed." }, 403, origin);
    }

    // No user id is accepted from request data. Always delete the verified JWT owner.
    const admin = createClient(url, secret, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) {
      return json({ error: "Could not delete the account. Try again or contact support." }, 503, origin);
    }

    // Coding progress has a foreign key ON DELETE CASCADE to auth.users.
    // A deleted user's existing JWT may remain valid until expiry; keep JWTs short
    // and consult Auth session revocation requirements before public launch.
    return json({ deleted: true }, 200, origin);
  } catch {
    // Never send a password, token, secret or internal exception to clients or logs.
    return json({ error: "Account deletion is temporarily unavailable." }, 503, origin);
  }
});
