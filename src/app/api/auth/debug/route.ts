import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks: Record<string, string> = {};

  // Check env vars
  checks.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Missing";
  checks.NEXTAUTH_URL = process.env.NEXTAUTH_URL || "❌ Missing";
  checks.DATABASE_URL = process.env.DATABASE_URL ? "✅ Set" : "❌ Missing";
  checks.AUTH_SECRET = process.env.AUTH_SECRET ? "✅ Set" : "not set (NEXTAUTH_SECRET used instead)";

  // Check database connection
  try {
    const userCount = await prisma.user.count();
    checks.database = `✅ Connected (${userCount} users)`;
  } catch (err) {
    checks.database = `❌ ${err instanceof Error ? err.message : "Connection failed"}`;
  }

  return Response.json(checks);
}
