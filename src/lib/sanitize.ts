/**
 * Remove tags HTML/script de uma string para prevenir XSS.
 * Também normaliza espaços em branco excessivos.
 */
export function sanitize(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers (onclick=, onerror=, etc.)
    .replace(/data:\s*text\/html/gi, '') // Remove data:text/html
    .trim();
}

/**
 * Sanitiza recursivamente todos os valores string de um objeto.
 */
export function sanitizeObject<T>(obj: T): T {
  if (typeof obj === 'string') {
    return sanitize(obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject) as T;
  }

  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = sanitizeObject(value);
    }
    return result as T;
  }

  return obj;
}
