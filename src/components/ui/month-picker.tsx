'use client';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';

const MONTHS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

export interface MonthPickerProps {
  /** Value in "YYYY-MM" format */
  value?: string;
  /** Called with value in "YYYY-MM" format */
  onChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MonthPicker({
  value,
  onChange,
  disabled,
  placeholder = 'Selecione o mês',
}: MonthPickerProps) {
  const [open, setOpen] = React.useState(false);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // Parse value to get displayed year for navigation
  const parsedYear = value ? parseInt(value.split('-')[0]) : currentYear;
  const parsedMonth = value ? parseInt(value.split('-')[1]) - 1 : currentMonth;

  const [displayYear, setDisplayYear] = React.useState(parsedYear);

  // Update displayYear when value changes
  React.useEffect(() => {
    if (value) {
      setDisplayYear(parseInt(value.split('-')[0]));
    }
  }, [value]);

  const handleSelect = (monthIndex: number) => {
    const formatted = `${displayYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    onChange?.(formatted);
    setOpen(false);
  };

  const displayLabel = value
    ? `${MONTHS[parsedMonth]} ${parsedYear}`
    : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          data-empty={!value}
          className={cn(
            'w-full justify-start text-left font-normal',
            'data-[empty=true]:text-muted-foreground',
          )}
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          {displayLabel || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        {/* Year navigation */}
        <div className="flex items-center justify-between mb-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setDisplayYear((y) => y - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold">{displayYear}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setDisplayYear((y) => y + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-4 gap-1.5">
          {MONTHS.map((month, index) => {
            const isSelected =
              parsedMonth === index && parsedYear === displayYear;
            const isCurrent =
              currentMonth === index && currentYear === displayYear;

            return (
              <Button
                key={month}
                type="button"
                variant={isSelected ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'h-8 text-xs',
                  isCurrent &&
                    !isSelected &&
                    'border border-primary text-primary',
                )}
                onClick={() => handleSelect(index)}
              >
                {month}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
