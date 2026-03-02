'use client';

import { cn } from '@/lib/utils';
import * as React from 'react';

/**
 * Formats a numeric value (in reais) to "R$ 1.234,56" display string.
 */
function formatToBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Parses a BRL formatted string to a number.
 * Strips everything except digits and treats the last 2 digits as cents.
 */
function parseBRL(raw: string): number {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return 0;
  return parseInt(digits, 10) / 100;
}

export interface CurrencyInputProps extends Omit<
  React.ComponentProps<'input'>,
  'value' | 'onChange' | 'type'
> {
  /** Numeric value in reais (e.g. 1234.56) */
  value: number | '' | undefined | null;
  /** Called with the numeric value */
  onChange: (value: number) => void;
  onBlur?: () => void;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, onBlur, name, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('');

    // Sync display when value changes externally (e.g. form reset, "Dividir igualmente")
    React.useEffect(() => {
      const numericValue =
        value === '' || value === undefined || value === null ? 0 : value;
      setDisplayValue(formatToBRL(numericValue));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const numericValue = parseBRL(raw);
      setDisplayValue(formatToBRL(numericValue));
      onChange(numericValue);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Select all on focus for easy replacement
      setTimeout(() => e.target.select(), 0);
    };

    return (
      <input
        ref={ref}
        name={name}
        type="text"
        inputMode="numeric"
        data-slot="input"
        className={cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          className,
        )}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={onBlur}
        {...props}
      />
    );
  },
);

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };
