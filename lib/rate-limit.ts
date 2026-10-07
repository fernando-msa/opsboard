type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const record = store.get(identifier);

  if (!record || record.resetAt <= now) {
    store.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetInMs: windowMs };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, resetInMs: record.resetAt - now };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count, resetInMs: record.resetAt - now };
}

export function resetRateLimit(identifier: string): void {
  store.delete(identifier);
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}
