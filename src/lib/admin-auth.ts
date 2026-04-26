import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let dbUser;
  try {
    dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, email: true },
    });
  } catch {
    dbUser = null;
  }

  if (!dbUser || dbUser.role !== "ADMIN") redirect("/");
  return dbUser;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
