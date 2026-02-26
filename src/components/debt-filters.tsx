'use client';

import { Card } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CreditCard, PersonCompany } from '@prisma/client';
import { CalendarClock, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

interface DebtFiltersProps {
  creditCards: CreditCard[];
  personCompanies: PersonCompany[];
  initialCardId?: string;
  initialPersonCompanyId?: string;
  initialMonth?: string;
  initialYear?: string;
}

export default function DebtFilters({
  creditCards,
  personCompanies,
  initialCardId,
  initialPersonCompanyId,
  initialMonth,
  initialYear,
}: DebtFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCardId, setSelectedCardId] = useState(initialCardId || 'all');
  const [selectedPersonCompanyId, setSelectedPersonCompanyId] = useState(
    initialPersonCompanyId || 'all',
  );
  const [selectedMonth, setSelectedMonth] = useState(initialMonth || 'all');
  const [selectedYear, setSelectedYear] = useState(initialYear || 'all');

  useEffect(() => {
    setSelectedCardId(initialCardId || 'all');
    setSelectedPersonCompanyId(initialPersonCompanyId || 'all');
    setSelectedMonth(initialMonth || 'all');
    setSelectedYear(initialYear || 'all');
  }, [initialCardId, initialPersonCompanyId, initialMonth, initialYear]);

  const navigate = useCallback(
    (cardId: string, personCompanyId: string, month: string, year: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (cardId !== 'all') params.set('cardId', cardId);
      else params.delete('cardId');

      if (personCompanyId !== 'all')
        params.set('personCompanyId', personCompanyId);
      else params.delete('personCompanyId');

      if (month !== 'all') params.set('month', month);
      else params.delete('month');

      if (year !== 'all') params.set('year', year);
      else params.delete('year');

      router.push(`/debts?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleCardChange = (value: string) => {
    setSelectedCardId(value);
    navigate(value, selectedPersonCompanyId, selectedMonth, selectedYear);
  };

  const handlePersonCompanyChange = (value: string) => {
    setSelectedPersonCompanyId(value);
    navigate(selectedCardId, value, selectedMonth, selectedYear);
  };

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
    // Se escolheu mês mas não tem ano, usa o ano atual
    const year =
      selectedYear === 'all'
        ? new Date().getFullYear().toString()
        : selectedYear;
    if (value === 'all') {
      setSelectedYear('all');
      navigate(selectedCardId, selectedPersonCompanyId, 'all', 'all');
    } else {
      setSelectedYear(year);
      navigate(selectedCardId, selectedPersonCompanyId, value, year);
    }
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    navigate(selectedCardId, selectedPersonCompanyId, selectedMonth, value);
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    const month = (now.getMonth() + 1).toString();
    const year = now.getFullYear().toString();
    setSelectedMonth(month);
    setSelectedYear(year);
    navigate(selectedCardId, selectedPersonCompanyId, month, year);
  };

  const clearFilters = () => {
    setSelectedCardId('all');
    setSelectedPersonCompanyId('all');
    setSelectedMonth('all');
    setSelectedYear('all');
    router.push('/debts');
  };

  const hasActiveFilters =
    selectedCardId !== 'all' ||
    selectedPersonCompanyId !== 'all' ||
    selectedMonth !== 'all' ||
    selectedYear !== 'all';

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 3 + i);

  return (
    <Card className="p-4">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="grid gap-1.5 flex-1 min-w-0">
          <label
            htmlFor="filterCard"
            className="text-xs font-medium text-muted-foreground"
          >
            Cartão
          </label>
          <Select value={selectedCardId} onValueChange={handleCardChange}>
            <SelectTrigger id="filterCard">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Cartões</SelectItem>
              {creditCards.map((card) => (
                <SelectItem key={card.id} value={card.id}>
                  {card.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5 flex-1 min-w-0">
          <label
            htmlFor="filterPersonCompany"
            className="text-xs font-medium text-muted-foreground"
          >
            Pessoa/Empresa
          </label>
          <Select
            value={selectedPersonCompanyId}
            onValueChange={handlePersonCompanyChange}
          >
            <SelectTrigger id="filterPersonCompany">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {personCompanies.map((pc) => (
                <SelectItem key={pc.id} value={pc.id}>
                  {pc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5 flex-1 min-w-0">
          <label className="text-xs font-medium text-muted-foreground">
            Mês
          </label>
          <Select value={selectedMonth} onValueChange={handleMonthChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {MONTH_NAMES.map((name, i) => (
                <SelectItem key={i} value={(i + 1).toString()}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5 flex-1 min-w-0">
          <label className="text-xs font-medium text-muted-foreground">
            Ano
          </label>
          <Select value={selectedYear} onValueChange={handleYearChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button onClick={handleCurrentMonth} variant="outline">
            <CalendarClock className="h-4 w-4" />
            Mês Atual
          </Button>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="ghost" size="icon">
              <XCircle className="h-4 w-4" />
              <span className="sr-only">Limpar filtros</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
