/**
 * Format a number as Brazilian Real (BRL) currency.
 * @param value - The numeric value to format
 * @returns Formatted string like "R$ 1.200,50"
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
