import { NextResponse } from "next/server";

// Types for better type safety
interface ExchangeRates {
  USD: number;
  BRL: number;
  EUR: number;
  CNY: number;
}

interface ApiResponse {
  rates: Record<string, number>;
  success?: boolean;
}

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const DEFAULT_RATES: ExchangeRates = {
  USD: 1,
  BRL: 5.5,
  EUR: 0.92,
  CNY: 7.2,
};

// In-memory cache
let cache: ExchangeRates | null = null;
let lastFetch = 0;

// Validate and sanitize rate values
function sanitizeRate(value: unknown): number {
  const num = Number(value);
  return !isNaN(num) && num > 0 ? num : 1;
}

export async function GET() {
  const now = Date.now();

  // Return cached data if still valid
  if (cache && now - lastFetch < CACHE_DURATION) {
    return NextResponse.json(cache, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  }

  try {
    // Fetch fresh data with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const res = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD",
      { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`API responded with status: ${res.status}`);
    }

    const data: ApiResponse = await res.json();

    // Validate API response structure
    if (!data.rates || typeof data.rates !== 'object') {
      throw new Error('Invalid API response structure');
    }

    // Update cache with sanitized values
    cache = {
      USD: 1,
      BRL: sanitizeRate(data.rates.BRL),
      EUR: sanitizeRate(data.rates.EUR),
      CNY: sanitizeRate(data.rates.CNY),
    };
    lastFetch = now;

    return NextResponse.json(cache, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });

  } catch (error) {
    console.error('Exchange rate fetch error:', error);

    // Return stale cache if available, otherwise use defaults
    const fallbackData = cache || DEFAULT_RATES;
    
    return NextResponse.json(fallbackData, {
      status: cache ? 200 : 503, // 200 if stale cache, 503 if defaults
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'X-Cache-Status': cache ? 'stale' : 'default',
      },
    });
  }
}

// Optional: Add revalidation configuration for Next.js
export const revalidate = 300; // Revalidate every 5 minutes