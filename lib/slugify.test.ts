import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
  it('converts to lowercase and replaces spaces with hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes accents', () => {
    expect(slugify('São Paulo')).toBe('sao-paulo');
    expect(slugify('Ênfase')).toBe('enfase');
  });

  it('removes special characters', () => {
    expect(slugify('My@Company!Inc.')).toBe('my-company-inc');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('a---b')).toBe('a-b');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('--hello--')).toBe('hello');
  });

  it('returns fallback for empty result', () => {
    const result = slugify('!!!');
    expect(result).toMatch(/^org-\d+$/);
  });

  it('handles normal organization names', () => {
    expect(slugify('Acme Corp')).toBe('acme-corp');
    expect(slugify('Tech Solutions Ltd')).toBe('tech-solutions-ltd');
  });
});
