import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/app-error';
import { comparePassword, hashPassword } from '../../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { env } from '../../config/env';
import type { LoginInput, RegisterInput } from './auth.schema';

const REFRESH_TOKEN_TTL_MS = parseExpiryToMs(env.JWT_REFRESH_EXPIRES_IN);

function parseExpiryToMs(expiry: string): number {
  const match = /^(\d+)([smhd])$/.exec(expiry);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = Number(match[1]);
  const unit = match[2];
  const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit] ?? 86_400_000;
  return value * unitMs;
}

const sanitizeUser = (user: { id: string; email: string; name: string | null }) => ({
  id: user.id,
  email: user.email,
  name: user.name,
});

const issueTokens = async (user: { id: string; email: string }) => {
  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id, email: user.email });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  return { accessToken, refreshToken };
};

export const registerUser = async (input: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError(409, 'Email is already registered');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { email: input.email, passwordHash, name: input.name },
  });

  const tokens = await issueTokens(user);
  return { user: sanitizeUser(user), ...tokens };
};

export const loginUser = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'Invalid email or password');
  }

  const tokens = await issueTokens(user);
  return { user: sanitizeUser(user), ...tokens };
};

export const refreshTokens = async (refreshToken: string) => {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, 'Invalid or expired refresh token');
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new AppError(401, 'Invalid or expired refresh token');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw new AppError(401, 'Invalid or expired refresh token');
  }

  // rotate: revoke the used token and issue a new pair
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
  const tokens = await issueTokens(user);

  return { user: sanitizeUser(user), ...tokens };
};

export const logoutUser = async (refreshToken: string) => {
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken, revoked: false },
    data: { revoked: true },
  });
};

export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  return sanitizeUser(user);
};
