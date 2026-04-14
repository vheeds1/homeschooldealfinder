import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/generated/prisma";

// ── Authenticated user helper ──────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * Resolves the authenticated Supabase user and fetches their DB record.
 * Returns `null` when no valid session exists.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, role: true },
  });

  return dbUser ?? null;
}

/**
 * Returns true when the authenticated user has ADMIN role.
 */
export function isAdmin(user: AuthUser): boolean {
  return user.role === "ADMIN";
}

// ── Rate limiter (in-memory, per-process) ──────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupBuckets() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of buckets) {
    if (now > entry.resetAt) buckets.delete(key);
  }
}

/**
 * Simple sliding-window rate limiter.
 *
 * @param key      unique bucket key (e.g. `ip:127.0.0.1` or `user:abc`)
 * @param limit    max requests per window
 * @param windowMs window size in milliseconds (default 60 s)
 * @returns `{ ok, remaining, resetAt }` — `ok` is false when the limit is exceeded
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs = 60_000,
): { ok: boolean; remaining: number; resetAt: number } {
  cleanupBuckets();

  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  entry.count += 1;

  if (entry.count > limit) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { ok: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

// ── JSON response helpers ──────────────────────────────────────────────────

export function jsonOk(data: unknown, meta?: Record<string, unknown>) {
  return Response.json({ data, error: null, meta: meta ?? null });
}

export function jsonError(message: string, status = 400) {
  return Response.json(
    { data: null, error: message, meta: null },
    { status },
  );
}

export function jsonUnauthorized() {
  return jsonError("Authentication required", 401);
}

export function jsonForbidden() {
  return jsonError("Forbidden", 403);
}
