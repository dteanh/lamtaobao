import bcrypt from 'bcryptjs';
import { prisma } from '@culi/db';
import { err, ok, type AppResult } from '../shared/result';

export type AdminSession = {
  userId: string;
  email: string;
  role: 'ADMIN';
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  if (!hash) return false;
  if (hash.startsWith('$2')) {
    return bcrypt.compare(password, hash);
  }
  // legacy dev-only plain fallback for migration path
  return password === hash;
}

export async function authenticateAdmin(input: { email: string; password: string }): Promise<AppResult<AdminSession>> {
  const user = await prisma.user.findUnique({ where: { email: input.email.trim().toLowerCase() } });
  if (!user || user.role !== 'ADMIN' || !user.isActive) {
    return err('INVALID_CREDENTIALS', 'Invalid admin credentials');
  }
  const isValid = await verifyPassword(input.password, user.passwordHash ?? '');
  if (!isValid) {
    return err('INVALID_CREDENTIALS', 'Invalid admin credentials');
  }
  if (user.passwordHash && !user.passwordHash.startsWith('$2')) {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(input.password) },
    });
  }
  return ok({ userId: user.id, email: user.email, role: 'ADMIN' });
}
