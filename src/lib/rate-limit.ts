// lib/rate-limit.ts
import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export const rateLimit = async (identifier: string, limit = 10, window = 60) => {
  const key = `rate_limit:${identifier}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, window);
  }
  
  if (current > limit) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  
  return null;
};