'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { debtSchema, type DebtFormData } from '@/lib/schemas/debt';
import type { CreditCard, PersonCompany } from '@prisma/client';

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
  const router = useRouter();

  const form = useForm<DebtFormData>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      cardId: debt?.cardId ?? '',
      personCompanyId: debt?.personCompanyId ?? '',
      totalAmount: debt?.totalAmount ?? undefined,
      installmentsQuantity: debt?.installmentsQuantity ?? undefined,
      startDate: debt?.startDate
        ? debt.startDate.toISOString().split('T')[0]
        : '',
      description: debt?.description ?? '',
    },
  });

  const onSubmit = async (data: DebtFormData) => {
    try {
      const url = debt ? `/api/debts/${debt.id}` : '/api/debts';
      const method = debt ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Erro ao salvar a dívida.');
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
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{debt ? 'Editar Dívida' : 'Nova Dívida/Despesa'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="cardId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cartão</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cartão" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {creditCards.map((card) => (
                        <SelectItem key={card.id} value={card.id}>
                          {card.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="personCompanyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pessoa/Empresa</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma pessoa/empresa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {personCompanies.map((pc) => (
                        <SelectItem key={pc.id} value={pc.id}>
                          {pc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Total da Dívida</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 1200.50"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="installmentsQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade de Parcelas</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Ex: 12"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Início (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    Deixe em branco para usar o mês atual como início.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição/Título da Dívida</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Notebook Dell, Viagem RJ"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-4 pt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={form.formState.isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Salvando...' : 'Salvar Dívida'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
