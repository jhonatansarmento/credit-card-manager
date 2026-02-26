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
import type { CreditCard as CreditCardType } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface CreditCardFormProps {
  card?: CreditCardType;
}

export default function CreditCardForm({ card }: CreditCardFormProps) {
  const [name, setName] = useState(card?.name || '');
  const [dueDay, setDueDay] = useState(card?.dueDay.toString() || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const url = card ? `/api/cards/${card.id}` : '/api/cards';
      const method = card ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, dueDay: Number(dueDay) }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao salvar o cartão.');
      }

      toast.success(
        card ? 'Cartão atualizado com sucesso!' : 'Cartão criado com sucesso!',
      );
      router.push('/cards');
      router.refresh();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao salvar o cartão.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {card ? 'Editar Cartão de Crédito' : 'Novo Cartão de Crédito'}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome do Cartão</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ex: Nubank, Inter Mastercard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dueDay">Dia de Vencimento</Label>
            <Input
              id="dueDay"
              name="dueDay"
              type="number"
              placeholder="Ex: 10 (para dia 10 do mês)"
              min="1"
              max="31"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar Cartão'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
