'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CreditCard, PersonCompany } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface SerializedDebt {
  id: string;
  cardId: string;
  personCompanyId: string;
  totalAmount: number;
  installmentsQuantity: number;
  installmentValue: number;
  startDate: Date;
  description: string;
}

interface DebtFormProps {
  debt?: SerializedDebt;
  creditCards: CreditCard[];
  personCompanies: PersonCompany[];
}

export default function DebtForm({
  debt,
  creditCards,
  personCompanies,
}: DebtFormProps) {
  const [cardId, setCardId] = useState<string | undefined>(
    debt?.cardId || undefined,
  );
  const [personCompanyId, setPersonCompanyId] = useState<string | undefined>(
    debt?.personCompanyId || undefined,
  );
  const [totalAmount, setTotalAmount] = useState(
    debt?.totalAmount.toString() || '',
  );
  const [installmentsQuantity, setInstallmentsQuantity] = useState(
    debt?.installmentsQuantity.toString() || '',
  );
  const [startDate, setStartDate] = useState(
    debt?.startDate.toISOString().split('T')[0] || '',
  );
  const [description, setDescription] = useState(debt?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const url = debt ? `/api/debts/${debt.id}` : '/api/debts';
      const method = debt ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: cardId ?? '',
          personCompanyId: personCompanyId ?? '',
          totalAmount: Number(totalAmount),
          installmentsQuantity: Number(installmentsQuantity),
          startDate,
          description,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao salvar a dívida.');
      }

      toast.success(
        debt ? 'Dívida atualizada com sucesso!' : 'Dívida criada com sucesso!',
      );
      router.push('/debts');
      router.refresh();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao salvar a dívida.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{debt ? 'Editar Dívida' : 'Nova Dívida/Despesa'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="cardId">Cartão</Label>
            <Select
              name="cardId"
              value={cardId}
              onValueChange={setCardId}
              required
            >
              <SelectTrigger id="cardId">
                <SelectValue placeholder="Selecione um cartão" />
              </SelectTrigger>
              <SelectContent>
                {creditCards.map((card) => (
                  <SelectItem key={card.id} value={card.id}>
                    {card.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="personCompanyId">Pessoa/Empresa</Label>
            <Select
              name="personCompanyId"
              value={personCompanyId}
              onValueChange={setPersonCompanyId}
              required
            >
              <SelectTrigger id="personCompanyId">
                <SelectValue placeholder="Selecione uma pessoa/empresa" />
              </SelectTrigger>
              <SelectContent>
                {personCompanies.map((pc) => (
                  <SelectItem key={pc.id} value={pc.id}>
                    {pc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="totalAmount">Valor Total da Dívida</Label>
            <Input
              id="totalAmount"
              name="totalAmount"
              type="number"
              step="0.01"
              placeholder="Ex: 1200.50"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="installmentsQuantity">Quantidade de Parcelas</Label>
            <Input
              id="installmentsQuantity"
              name="installmentsQuantity"
              type="number"
              min="1"
              placeholder="Ex: 12"
              value={installmentsQuantity}
              onChange={(e) => setInstallmentsQuantity(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="startDate">Data de Início (Opcional)</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Deixe em branco para usar o mês atual como início.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição/Título da Dívida</Label>
            <Input
              id="description"
              name="description"
              placeholder="Ex: Notebook Dell, Viagem RJ"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4 pt-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar Dívida'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
