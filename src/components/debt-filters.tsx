'use client';

import { Card } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CreditCard, PersonCompany } from '@prisma/client';
import {
  Archive,
  ArrowDownAZ,
  CalendarClock,
  Download,
  Search,
  XCircle,
} from 'lucide-react';
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
  initialSearch?: string;
  initialSortBy?: string;
  initialSortOrder?: string;
  initialShowArchived?: boolean;
}

export default function DebtFilters({
  creditCards,
  personCompanies,
  initialCardId,
  initialPersonCompanyId,
  initialMonth,
  initialYear,
  initialSearch,
  initialSortBy,
  initialSortOrder,
  initialShowArchived,
}: DebtFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCardId, setSelectedCardId] = useState(initialCardId || 'all');
  const [selectedPersonCompanyId, setSelectedPersonCompanyId] = useState(
    initialPersonCompanyId || 'all',
  );
  const [selectedMonth, setSelectedMonth] = useState(initialMonth || 'all');
  const [selectedYear, setSelectedYear] = useState(initialYear || 'all');
  const [searchText, setSearchText] = useState(initialSearch || '');
  const [sortBy, setSortBy] = useState(initialSortBy || 'createdAt');
  const [sortOrder, setSortOrder] = useState(initialSortOrder || 'desc');
  const [showArchived, setShowArchived] = useState(
    initialShowArchived || false,
  );

  useEffect(() => {
    setSelectedCardId(initialCardId || 'all');
    setSelectedPersonCompanyId(initialPersonCompanyId || 'all');
    setSelectedMonth(initialMonth || 'all');
    setSelectedYear(initialYear || 'all');
    setSearchText(initialSearch || '');
    setSortBy(initialSortBy || 'createdAt');
    setSortOrder(initialSortOrder || 'desc');
    setShowArchived(initialShowArchived || false);
  }, [
    initialCardId,
    initialPersonCompanyId,
    initialMonth,
    initialYear,
    initialSearch,
    initialSortBy,
    initialSortOrder,
    initialShowArchived,
  ]);

  const navigate = useCallback(
    (overrides: Record<string, string | undefined> = {}) => {
      const params = new URLSearchParams(searchParams.toString());

      // Remove page when filters change
      params.delete('page');

      const values: Record<string, string | undefined> = {
        cardId:
          overrides.cardId !== undefined ? overrides.cardId : selectedCardId,
        personCompanyId:
          overrides.personCompanyId !== undefined
            ? overrides.personCompanyId
            : selectedPersonCompanyId,
        month: overrides.month !== undefined ? overrides.month : selectedMonth,
        year: overrides.year !== undefined ? overrides.year : selectedYear,
        search: overrides.search !== undefined ? overrides.search : searchText,
        sortBy: overrides.sortBy !== undefined ? overrides.sortBy : sortBy,
        sortOrder:
          overrides.sortOrder !== undefined ? overrides.sortOrder : sortOrder,
        showArchived:
          overrides.showArchived !== undefined
            ? overrides.showArchived
            : showArchived
              ? 'true'
              : undefined,
      };

      for (const [key, value] of Object.entries(values)) {
        if (
          !value ||
          value === 'all' ||
          (key === 'sortBy' && value === 'createdAt') ||
          (key === 'sortOrder' && value === 'desc')
        ) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      const qs = params.toString();
      router.push(qs ? `/debts?${qs}` : '/debts');
    },
    [
      router,
      searchParams,
      selectedCardId,
      selectedPersonCompanyId,
      selectedMonth,
      selectedYear,
      searchText,
      sortBy,
      sortOrder,
      showArchived,
    ],
  );

  const handleCardChange = (value: string) => {
    setSelectedCardId(value);
    navigate({ cardId: value });
  };

  const handlePersonCompanyChange = (value: string) => {
    setSelectedPersonCompanyId(value);
    navigate({ personCompanyId: value });
  };

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
    if (value === 'all') {
      setSelectedYear('all');
      navigate({ month: 'all', year: 'all' });
    } else {
      const y =
        selectedYear === 'all'
          ? new Date().getFullYear().toString()
          : selectedYear;
      setSelectedYear(y);
      navigate({ month: value, year: y });
    }
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    navigate({ year: value });
  };

  const handleSearch = () => {
    navigate({ search: searchText || undefined });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    navigate({ sortBy: value });
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    navigate({ sortOrder: newOrder });
  };

  const toggleArchived = () => {
    const next = !showArchived;
    setShowArchived(next);
    navigate({ showArchived: next ? 'true' : undefined });
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    const m = (now.getMonth() + 1).toString();
    const y = now.getFullYear().toString();
    setSelectedMonth(m);
    setSelectedYear(y);
    navigate({ month: m, year: y });
  };

  const handleExportCSV = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    params.delete('pageSize');
    const qs = params.toString();
    window.open(`/api/debts/export${qs ? `?${qs}` : ''}`, '_blank');
  };

  const clearFilters = () => {
    setSelectedCardId('all');
    setSelectedPersonCompanyId('all');
    setSelectedMonth('all');
    setSelectedYear('all');
    setSearchText('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setShowArchived(false);
    router.push('/debts');
  };

  const hasActiveFilters =
    selectedCardId !== 'all' ||
    selectedPersonCompanyId !== 'all' ||
    selectedMonth !== 'all' ||
    selectedYear !== 'all' ||
    searchText !== '' ||
    sortBy !== 'createdAt' ||
    sortOrder !== 'desc' ||
    showArchived;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 3 + i);

  return (
    <Card className="p-4">
      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch} variant="secondary">
          Buscar
        </Button>
      </div>

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

      {/* Sort + actions bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4 pt-4 border-t">
        <div className="flex items-center gap-2 flex-1">
          <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            Ordenar por:
          </label>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Data de criação</SelectItem>
              <SelectItem value="description">Descrição</SelectItem>
              <SelectItem value="totalAmount">Valor total</SelectItem>
              <SelectItem value="startDate">Data de início</SelectItem>
              <SelectItem value="installmentsQuantity">Nº parcelas</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSortOrder}
            title={sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
          >
            <ArrowDownAZ
              className={`h-4 w-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
            />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showArchived ? 'default' : 'outline'}
            size="sm"
            onClick={toggleArchived}
            title={showArchived ? 'Mostrando arquivadas' : 'Mostrar arquivadas'}
          >
            <Archive className="h-4 w-4 mr-1" />
            {showArchived ? 'Arquivadas' : 'Mostrar Arquivadas'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-1" />
            Exportar CSV
          </Button>
        </div>
      </div>
    </Card>
  );
}
