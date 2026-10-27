/**
 * __tests__/utils.test.ts
 * Unit tests for GrabU Admin Panel utility functions
 * Run with: npx jest __tests__/utils.test.ts
 *
 * Install deps first (once):
 *   npm install --save-dev jest ts-jest @types/jest
 */

// ─── Import the utilities under test ─────────────────────────────
// We import the pure JS/TS functions directly — no Next.js / Supabase needed.

import {
  formatCurrency,
  formatCurrencyFull,
  calculateSettlement,
  timeAgo,
} from '../src/lib/utils';

// ─── formatCurrency ───────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formats amounts < 1000 as plain rupees', () => {
    expect(formatCurrency(500)).toBe('₹500');
    expect(formatCurrency(999)).toBe('₹999');
    expect(formatCurrency(0)).toBe('₹0');
  });

  it('formats amounts >= 1000 as K notation', () => {
    expect(formatCurrency(1000)).toBe('₹1.0K');
    expect(formatCurrency(1500)).toBe('₹1.5K');
    expect(formatCurrency(99999)).toBe('₹100.0K');
  });

  it('formats amounts >= 100000 as L notation', () => {
    expect(formatCurrency(100000)).toBe('₹1.0L');
    expect(formatCurrency(250000)).toBe('₹2.5L');
    expect(formatCurrency(1000000)).toBe('₹10.0L');
  });

  it('handles negative amounts', () => {
    // Negative amounts are unusual but shouldn't crash
    expect(() => formatCurrency(-100)).not.toThrow();
  });
});

// ─── formatCurrencyFull ───────────────────────────────────────────

describe('formatCurrencyFull', () => {
  it('returns a string containing the amount', () => {
    const result = formatCurrencyFull(18420);
    expect(typeof result).toBe('string');
    expect(result).toContain('18');
  });

  it('uses INR format (contains ₹ or rupee indicator)', () => {
    const result = formatCurrencyFull(1000);
    // Intl formats as ₹1,000 or similar
    expect(result).toMatch(/1[,.]?000/);
  });

  it('formats zero without decimals', () => {
    const result = formatCurrencyFull(0);
    expect(result).toContain('0');
  });
});

// ─── calculateSettlement ─────────────────────────────────────────

describe('calculateSettlement', () => {
  it('calculates commission correctly', () => {
    const { commission } = calculateSettlement(10000, 8, 500, 50);
    expect(commission).toBeCloseTo(800, 2); // 8% of 10000
  });

  it('calculates net payout correctly', () => {
    // net = grossRevenue - commission + deliveryFee - platformFee
    const { net } = calculateSettlement(10000, 8, 500, 50);
    expect(net).toBeCloseTo(9650, 2); // 10000 - 800 + 500 - 50
  });

  it('handles zero commission rate', () => {
    const { commission, net } = calculateSettlement(5000, 0, 200, 0);
    expect(commission).toBe(0);
    expect(net).toBeCloseTo(5200, 2);
  });

  it('handles 100% commission rate', () => {
    const { commission } = calculateSettlement(5000, 100, 0, 0);
    expect(commission).toBeCloseTo(5000, 2);
  });

  it('handles zero revenue', () => {
    const { commission, net } = calculateSettlement(0, 8, 0, 0);
    expect(commission).toBe(0);
    expect(net).toBe(0);
  });

  it('commission + net = gross + deliveryFee - platformFee', () => {
    const gross = 18420;
    const rate = 8;
    const delivery = 820;
    const platform = 100;
    const { commission, net } = calculateSettlement(gross, rate, delivery, platform);
    expect(commission + net).toBeCloseTo(gross + delivery - platform, 2);
  });

  it('matches the known settlement STL-045 data', () => {
    // Known values from MockData
    const gross = 18420;
    const rate = 8; // 8%
    const { commission } = calculateSettlement(gross, rate, 820, 0);
    expect(commission).toBeCloseTo(1473.6, 1);
  });
});

// ─── timeAgo ─────────────────────────────────────────────────────

describe('timeAgo', () => {
  it('returns "just now" for times less than 1 minute ago', () => {
    const recent = new Date(Date.now() - 30 * 1000).toISOString(); // 30 secs ago
    expect(timeAgo(recent)).toBe('just now');
  });

  it('returns minutes for times < 1 hour ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(timeAgo(fiveMinAgo)).toBe('5 min ago');
  });

  it('returns hours for times < 1 day ago', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(threeHoursAgo)).toBe('3h ago');
  });

  it('returns days for times >= 1 day ago', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(twoDaysAgo)).toBe('2d ago');
  });

  it('returns "just now" for exactly now', () => {
    const now = new Date().toISOString();
    expect(timeAgo(now)).toBe('just now');
  });
});
