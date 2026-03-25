import { prisma } from '@culi/db';

const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;

export async function registerLoginAttempt(key: string, success: boolean) {
  const now = new Date();
  const resetAt = new Date(now.getTime() + WINDOW_MS);
  const existing = await prisma.loginRateLimit.findUnique({ where: { key } });

  if (success) {
    if (existing) {
      await prisma.loginRateLimit.delete({ where: { key } });
    }
    return;
  }

  if (!existing || existing.resetAt < now) {
    await prisma.loginRateLimit.upsert({
      where: { key },
      update: { count: 1, resetAt },
      create: { key, count: 1, resetAt },
    });
    return;
  }

  await prisma.loginRateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });
}

export async function isLoginRateLimited(key: string) {
  const now = new Date();
  const existing = await prisma.loginRateLimit.findUnique({ where: { key } });
  if (!existing) return false;
  if (existing.resetAt < now) {
    await prisma.loginRateLimit.delete({ where: { key } });
    return false;
  }
  return existing.count >= LIMIT;
}
