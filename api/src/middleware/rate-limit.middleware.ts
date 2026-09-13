import type { NextFunction, Request, RequestHandler, Response } from "express";
import {
  RateLimiterMemory,
  RateLimiterRedis,
  RateLimiterRes,
} from "rate-limiter-flexible";
import { redisClient } from "../utils/cacheable";
import { verifyAccessToken } from "../utils/jwt";

type RateLimitOptions = {
  keyPrefix: string;
  points: number;
  durationSeconds: number;
  blockDurationSeconds?: number;
  keyGenerator?: (req: Request) => string;
};

const requestIp = (req: Request) =>
  req.ip ?? req.socket.remoteAddress ?? "unknown";

export const userOrIpRateLimitKey = (req: Request) => {
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }

  const authorization = req.headers.authorization;
  if (authorization?.startsWith("Bearer ")) {
    try {
      const payload = verifyAccessToken(authorization.slice("Bearer ".length));
      return `user:${payload.sub}`;
    } catch {
      // Invalid credentials are treated as anonymous and limited by IP.
    }
  }

  return `ip:${requestIp(req)}`;
};

const setRateLimitHeaders = (
  res: Response,
  points: number,
  rateLimiterResponse: RateLimiterRes,
) => {
  res.setHeader("X-RateLimit-Limit", points);
  res.setHeader("X-RateLimit-Remaining", rateLimiterResponse.remainingPoints);
  res.setHeader(
    "X-RateLimit-Reset",
    Math.ceil((Date.now() + rateLimiterResponse.msBeforeNext) / 1000),
  );
};

export const rateLimit = ({
  keyPrefix,
  points,
  durationSeconds,
  blockDurationSeconds = 0,
  keyGenerator = requestIp,
}: RateLimitOptions): RequestHandler => {
  const insuranceLimiter = new RateLimiterMemory({
    keyPrefix: `${keyPrefix}:insurance`,
    points,
    duration: durationSeconds,
    blockDuration: blockDurationSeconds,
  });

  const limiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix,
    points,
    duration: durationSeconds,
    blockDuration: blockDurationSeconds,
    insuranceLimiter,
  });

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rateLimiterResponse = await limiter.consume(keyGenerator(req));
      setRateLimitHeaders(res, points, rateLimiterResponse);
      next();
    } catch (error) {
      if (!(error instanceof RateLimiterRes)) {
        next(error);
        return;
      }

      setRateLimitHeaders(res, points, error);
      res.setHeader("Retry-After", Math.ceil(error.msBeforeNext / 1000));
      res.status(429).json({ message: "Too many requests. Please try again later." });
    }
  };
};
