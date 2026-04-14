import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError, rateLimit } from "@/lib/api-helpers";
import type { Prisma } from "@/generated/prisma";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  preferences: z.record(z.string(), z.unknown()).optional(),
});

// ── POST /api/subscribe ────────────────────────────────────────────────────

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`subscribe:${ip}`, 5, 60_000);
  if (!rl.ok) {
    return jsonError("Too many requests. Try again later.", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const { email, preferences } = parsed.data;

  // Upsert so re-subscribing reactivates a previously unsubscribed email
  const subscriber = await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: {
      isActive: true,
      ...(preferences ? { preferences: preferences as Prisma.InputJsonValue } : {}),
    },
    create: {
      email,
      preferences: (preferences ?? {}) as Prisma.InputJsonValue,
    },
  });

  return Response.json(
    { data: { id: subscriber.id, email: subscriber.email }, error: null, meta: null },
    { status: 201 },
  );
}
