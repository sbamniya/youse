import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/app-error';
import { comparePassword, hashPassword } from '../../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { env } from '../../config/env';
import type { RequestOtpInput, VerifyOtpInput } from './auth.schema';

const REFRESH_TOKEN_TTL_MS = parseExpiryToMs(env.JWT_REFRESH_EXPIRES_IN);
const OTP_TTL_MS = 10 * 60 * 1000;

function parseExpiryToMs(expiry: string): number {
  const match = /^(\d+)([smhd])$/.exec(expiry);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = Number(match[1]);
  const unit = match[2];
  const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit] ?? 86_400_000;
  return value * unitMs;
}

const sanitizeUser = (user: {
  id: string;
  phone: string;
  name: string | null;
  profilePicture: string | null;
  timezone: string | null;
}) => ({
  id: user.id,
  phone: user.phone,
  name: user.name,
  profilePicture: user.profilePicture,
  timezone: user.timezone,
});

const issueTokens = async (user: { id: string; phone: string }) => {
  const accessToken = signAccessToken({ sub: user.id, phone: user.phone });
  const refreshToken = signRefreshToken({ sub: user.id, phone: user.phone });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  return { accessToken, refreshToken };
};

export const requestOtp = async (input: RequestOtpInput) => {
  const code = String(Math.floor(100_000 + Math.random() * 900_000));
  await prisma.otpChallenge.updateMany({
    where: { phone: input.phone, consumedAt: null },
    data: { consumedAt: new Date() },
  });
  await prisma.otpChallenge.create({
    data: {
      phone: input.phone,
      codeHash: await hashPassword(code),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  return env.NODE_ENV === 'production'
    ? { message: 'Verification code sent' }
    : { message: 'Verification code sent', developmentCode: code };
};

export const verifyOtp = async (input: VerifyOtpInput) => {
  const challenge = await prisma.otpChallenge.findFirst({
    where: { phone: input.phone, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (!challenge || !(await comparePassword(input.code, challenge.codeHash))) {
    throw new AppError(401, 'Invalid or expired verification code');
  }

  await prisma.otpChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } });
  const user = await prisma.user.upsert({
    where: { phone: input.phone },
    update: { deletedAt: null, ...(input.name ? { name: input.name } : {}) },
    create: { phone: input.phone, name: input.name },
  });
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
