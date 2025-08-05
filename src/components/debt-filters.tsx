'use client';

import { Card } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CreditCard, PersonCompany } from '@prisma/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Filter, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

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

  const [selectedCardId, setSelectedCardId] = useState(initialCardId || '');
  const [selectedPersonCompanyId, setSelectedPersonCompanyId] = useState(
    initialPersonCompanyId || ''
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialMonth && initialYear
      ? new Date(
          Number.parseInt(initialYear),
          Number.parseInt(initialMonth) - 1,
          1
        )
      : undefined
  );

  useEffect(() => {
    setSelectedCardId(initialCardId || '');
    setSelectedPersonCompanyId(initialPersonCompanyId || '');
    setSelectedDate(
      initialMonth && initialYear
        ? new Date(
            Number.parseInt(initialYear),
            Number.parseInt(initialMonth) - 1,
            1
          )
        : undefined
    );
  }, [initialCardId, initialPersonCompanyId, initialMonth, initialYear]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedCardId) {
      params.set('cardId', selectedCardId);
    } else {
      params.delete('cardId');
    }
    if (selectedPersonCompanyId) {
      params.set('personCompanyId', selectedPersonCompanyId);
    } else {
      params.delete('personCompanyId');
    }
    if (selectedDate) {
      params.set('month', (selectedDate.getMonth() + 1).toString());
      params.set('year', selectedDate.getFullYear().toString());
    } else {
      params.delete('month');
      params.delete('year');
    }
    router.push(`/debts?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedCardId('');
    setSelectedPersonCompanyId('');
    setSelectedDate(undefined);
    router.push('/debts');
  };

  return (
    <Card className='p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end'>
      <div className='grid gap-2'>
        <label htmlFor='filterCard' className='text-sm font-medium'>
          Filtrar por Cartão
        </label>
        <Select value={selectedCardId} onValueChange={setSelectedCardId}>
          <SelectTrigger id='filterCard'>
            <SelectValue placeholder='Todos os Cartões' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Todos os Cartões</SelectItem>
            {creditCards.map((card) => (
              <SelectItem key={card.id} value={card.id}>
                {card.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='grid gap-2'>
        <label htmlFor='filterPersonCompany' className='text-sm font-medium'>
          Filtrar por Pessoa/Empresa
        </label>
        <Select
          value={selectedPersonCompanyId}
          onValueChange={setSelectedPersonCompanyId}
        >
          <SelectTrigger id='filterPersonCompany'>
            <SelectValue placeholder='Todas as Pessoas/Empresas' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Todas as Pessoas/Empresas</SelectItem>
            {personCompanies.map((pc) => (
              <SelectItem key={pc.id} value={pc.id}>
                {pc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='grid gap-2'>
        <label htmlFor='filterMonthYear' className='text-sm font-medium'>
          Filtrar por Mês/Ano
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={'w-full justify-start text-left font-normal'}
            >
              <CalendarIcon className='mr-2 h-4 w-4' />
              {selectedDate ? (
                format(selectedDate, 'MMMM yyyy', { locale: ptBR })
              ) : (
                <span>Selecione Mês/Ano</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0'>
            <Calendar
              mode='single'
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
              captionLayout='dropdown-buttons'
              fromYear={2020}
              toYear={new Date().getFullYear() + 5}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className='flex gap-2'>
        <Button onClick={applyFilters} className='w-full'>
          <Filter className='h-4 w-4 mr-2' />
          Aplicar Filtros
        </Button>
        {(selectedCardId || selectedPersonCompanyId || selectedDate) && (
          <Button
            onClick={clearFilters}
            variant='outline'
            className='w-full bg-transparent'
          >
            <XCircle className='h-4 w-4 mr-2' />
            Limpar
          </Button>
        )}
      </div>
    </Card>
  );
}
