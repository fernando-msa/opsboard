import { describe, expect, it } from 'vitest';
import { checkRateLimit, resetRateLimit, getClientIp } from './rate-limit';

describe('rate-limit', () => {
  it('allows requests within limit', () => {
    const key = 'test-ip-1';
    resetRateLimit(key);

    const r1 = checkRateLimit(key, 3, 1000);
    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = checkRateLimit(key, 3, 1000);
    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = checkRateLimit(key, 3, 1000);
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0);

    const r4 = checkRateLimit(key, 3, 1000);
    expect(r4.success).toBe(false);
    expect(r4.remaining).toBe(0);
  });

  it('resets after window expires', async () => {
    const key = 'test-ip-2';
    resetRateLimit(key);

    checkRateLimit(key, 1, 50);
    const blocked = checkRateLimit(key, 1, 50);
    expect(blocked.success).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, 60));

    const allowed = checkRateLimit(key, 1, 50);
    expect(allowed.success).toBe(true);
  });

  it('extracts client IP from headers', () => {
    const req1 = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18' }
    });
    expect(getClientIp(req1)).toBe('203.0.113.195');

    const req2 = new Request('http://localhost', {
      headers: { 'x-real-ip': '198.51.100.1' }
    });
    expect(getClientIp(req2)).toBe('198.51.100.1');

    const req3 = new Request('http://localhost');
    expect(getClientIp(req3)).toBe('127.0.0.1');
  });
});
