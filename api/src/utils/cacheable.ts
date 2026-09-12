/* eslint-disable @typescript-eslint/no-explicit-any */
import Redis from "ioredis";
import { RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible";
import { logger } from "./logger";

export const redisClient = new Redis(process.env.REDIS_URL!);

redisClient
  .on("error", (err) => {
    logger.error({ msg: "Cacheable: Redis connection error", error: err });
  })
  .on("connect", () => {
    logger.info({ msg: "Cacheable: Redis connected" });
  });

type CacheableOptions<T, U extends any[]> = {
  generateKey: (...args: U) => Promise<string> | string;
  ttlSeconds: number;
  fetchData: (...args: U) => Promise<T | null> | T | null;
};

class Cacheable<T, U extends any[]> {
  private readonly options: CacheableOptions<T, U>;

  constructor(
    options: CacheableOptions<T, U> = {
      generateKey: () => "default",
      ttlSeconds: 60,
      fetchData: async () => null,
    },
  ) {
    this.options = options;
    return this;
  }

  private async cacheValue(key: string, value: any): Promise<string> {
    return await redisClient.set(
      key,
      JSON.stringify({
        data: value,
      }),
      "EX",
      this.options.ttlSeconds,
    );
  }

  private async retrieveValue(key: string): Promise<T | null> {
    const data = await redisClient.get(key);
    if (!data) {
      return null;
    }
    return JSON.parse(data).data;
  }

  async execute(...args: U): Promise<T | null> {
    const cacheKey = await this.options.generateKey(...args);
    const cachedData = await this.retrieveValue(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const freshData = await this.options.fetchData(...args);
    await this.cacheValue(cacheKey, freshData);
    return freshData;
  }

  async refresh(...args: U): Promise<T | null> {
    const freshData = await this.options.fetchData(...args);
    await this.cacheValue(await this.options.generateKey(...args), freshData);
    return freshData;
  }

  async invalidate(pattern: string): Promise<number> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }
      const deletedCount = await Promise.all(
        keys.map(async (k) => await redisClient.del(k)),
      );
      return deletedCount.reduce((a, b) => a + b, 0);
    } catch (error) {
      logger.error({ msg: "Cacheable: Invalidate error", error });
      return 0;
    }
  }
}

interface ThrottleOptions<T extends any[]> {
  execute: (...params: T) => any;
  generateKey: (...params: T) => string;
  keyPrefix?: string;
  durationMs?: number;
}

export const createThrottled = <T extends any[]>({
  execute,
  keyPrefix,
  generateKey,
  durationMs = 7500,
}: ThrottleOptions<T>) => {
  if (process.env.NODE_ENV === "test") {
    return execute;
  }

  const limiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix,
    points: 1,
    duration: durationMs / 1000, // Convert to seconds
  });

  return async function executeThrottled(...args: T) {
    const key = (generateKey ? generateKey(...args) : args[0]) as string;

    return await limiter
      .consume(key)
      .then(() => execute(...args))
      .catch((error) => {
        if (error instanceof RateLimiterRes) {
          logger.debug({ msg: "Throttle: Rate limit exceeded", key });
          // Rate limit exceeded, can safely ignore
        } else {
          logger.error({ msg: "Throttle: Redis error", error });
          throw error;
        }
      });
  };
};

export default Cacheable;
