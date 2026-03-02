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
import { Checkbox } from '@/components/ui/checkbox';
import { CurrencyInput } from '@/components/ui/currency-input';
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
import { Textarea } from '@/components/ui/textarea';
import {
  INCOME_TYPES,
  INCOME_TYPE_EMOJIS,
  INCOME_TYPE_LABELS,
  incomeSchema,
  type IncomeFormData,
} from '@/lib/schemas/income';

interface SerializedIncome {
  id: string;
  name: string;
  description?: string | null;
  amount: number;
  incomeType: string;
  isRecurring: boolean;
  receiveDay?: number | null;
  startDate?: string;
  endDate?: string | null;
}

interface IncomeFormProps {
  income?: SerializedIncome;
}

export default function IncomeForm({ income }: IncomeFormProps) {
  const router = useRouter();

  const form = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      name: income?.name ?? '',
      description: income?.description ?? '',
      amount: income?.amount ?? ('' as unknown as number),
      incomeType:
        (income?.incomeType as IncomeFormData['incomeType']) ?? 'SALARY',
      isRecurring: income?.isRecurring ?? false,
      receiveDay: income?.receiveDay ?? ('' as unknown as number),
      startDate: income?.startDate ?? '',
      endDate: income?.endDate ?? '',
    },
  });

  const watchedIsRecurring = form.watch('isRecurring');

  const onSubmit = async (data: IncomeFormData) => {
    try {
      const url = income ? `/api/incomes/${income.id}` : '/api/incomes';
      const method = income ? 'PUT' : 'POST';

      const payload = {
        ...data,
        receiveDay: data.isRecurring ? data.receiveDay : null,
        endDate: data.isRecurring ? data.endDate : '',
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Erro ao salvar o provento.');
      }

      toast.success(
        income
          ? 'Provento atualizado com sucesso!'
          : 'Provento criado com sucesso!',
      );
      router.push('/incomes');
      router.refresh();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao salvar o provento.',
      );
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{income ? 'Editar Provento' : 'Novo Provento'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Income Type */}
            <FormField
              control={form.control}
              name="incomeType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INCOME_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {INCOME_TYPE_EMOJIS[type]} {INCOME_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Salário Empresa X"
                      maxLength={100}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* isRecurring */}
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) {
                          form.setValue('receiveDay', 5);
                        } else {
                          form.setValue('receiveDay', '' as unknown as number);
                          form.setValue('endDate', '');
                        }
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Provento Recorrente</FormLabel>
                    <FormDescription>
                      Receita mensal fixa (ex: salário, aluguel)
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {watchedIsRecurring ? 'Valor Mensal' : 'Valor'}
                  </FormLabel>
                  <FormControl>
                    <CurrencyInput
                      placeholder="R$ 0,00"
                      value={field.value as number}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Receive Day — only for recurring */}
            {watchedIsRecurring && (
              <FormField
                control={form.control}
                name="receiveDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de Recebimento</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={31}
                        placeholder="Ex: 5"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? ''
                              : parseInt(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Dia do mês em que o valor é recebido (1-31)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Start Date */}
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Início</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    {watchedIsRecurring
                      ? 'Mês a partir do qual o provento é gerado'
                      : 'Data de recebimento'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Date — only for recurring */}
            {watchedIsRecurring && (
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Final (opcional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      Deixe vazio para proventos sem data limite (ex: salário)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre este provento..."
                      maxLength={500}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="flex-1"
            >
              {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
