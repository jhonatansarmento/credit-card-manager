import { NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Limpa entradas expiradas periodicamente
const CLEANUP_INTERVAL = 60_000; // 1 minuto
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}

interface RateLimitOptions {
  /** Número máximo de requisições na janela */
  limit?: number;
  /** Janela de tempo em milissegundos */
  windowMs?: number;
}

/**
 * Rate limiter in-memory para API routes.
 * Retorna null se a requisição é permitida, ou uma NextResponse 429 caso contrário.
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions = {},
): NextResponse | null {
  const { limit = 30, windowMs = 60_000 } = options;

  cleanup();

  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return null;
  }

  entry.count++;

  if (entry.count > limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { error: 'Muitas requisições. Tente novamente em breve.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(entry.resetAt),
        },
      },
    );
  }

  return null;
}
