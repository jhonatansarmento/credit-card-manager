'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/format';
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  debtSchema,
  type DebtFormData,
} from '@/lib/schemas/debt';
import type {
  Asset,
  Category,
  CreditCard,
  PersonCompany,
} from '@prisma/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PlusCircle } from 'lucide-react';

interface SerializedDebt {
  id: string;
  paymentMethod?: string;
  cardId?: string | null;
  personCompanyId: string;
  categoryId?: string | null;
  assetId?: string | null;
  dueDay?: number | null;
  totalAmount: number;
  installmentsQuantity: number;
  installmentValue: number;
  startDate: Date;
  description: string;
  isRecurring?: boolean;
}

interface DebtFormProps {
  debt?: SerializedDebt;
  creditCards: CreditCard[];
  personCompanies: PersonCompany[];
  categories?: Category[];
  assets?: Asset[];
  initialAssetId?: string;
}

interface PreviewInstallment {
  number: number;
  dueDate: Date;
  amount: number;
}

function generatePreview(
  totalAmount: number,
  installmentsQuantity: number,
  startDate: string,
  dueDay: number,
): PreviewInstallment[] {
  if (!totalAmount || !installmentsQuantity || !startDate || !dueDay) return [];

  const start = new Date(startDate + 'T00:00:00Z');
  if (isNaN(start.getTime())) return [];

  const baseValue = parseFloat((totalAmount / installmentsQuantity).toFixed(2));
  const sumOfBase = parseFloat(
    (baseValue * (installmentsQuantity - 1)).toFixed(2),
  );
  const lastValue = parseFloat((totalAmount - sumOfBase).toFixed(2));

  return Array.from({ length: installmentsQuantity }, (_, i) => {
    const rawMonth = start.getUTCMonth() + i;
    const targetYear = start.getUTCFullYear() + Math.floor(rawMonth / 12);
    const targetMonth = rawMonth % 12;
    const daysInMonth = new Date(
      Date.UTC(targetYear, targetMonth + 1, 0),
    ).getUTCDate();
    const day = Math.min(dueDay, daysInMonth);
    const isLast = i === installmentsQuantity - 1;

    return {
      number: i + 1,
      dueDate: new Date(Date.UTC(targetYear, targetMonth, day)),
      amount: isLast ? lastValue : baseValue,
    };
  });
}

export default function DebtForm({
  debt,
  creditCards,
  personCompanies,
  categories = [],
  assets = [],
  initialAssetId,
}: DebtFormProps) {
  const router = useRouter();
  const [localCards, setLocalCards] = useState(creditCards);
  const [localNames, setLocalNames] = useState(personCompanies);
  const [localAssets, setLocalAssets] = useState(assets);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [assetDialogOpen, setAssetDialogOpen] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [newCardDueDay, setNewCardDueDay] = useState('');
  const [newNameValue, setNewNameValue] = useState('');
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetEmoji, setNewAssetEmoji] = useState('📦');
  const [creatingCard, setCreatingCard] = useState(false);
  const [creatingName, setCreatingName] = useState(false);
  const [creatingAsset, setCreatingAsset] = useState(false);

  const form = useForm<DebtFormData>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      paymentMethod: (debt?.paymentMethod as any) ?? 'CREDIT_CARD',
      cardId: debt?.cardId ?? '',
      personCompanyId: debt?.personCompanyId ?? '',
      categoryId: debt?.categoryId ?? undefined,
      assetId: debt?.assetId ?? initialAssetId ?? undefined,
      dueDay: debt?.dueDay ?? undefined,
      totalAmount:
        debt?.isRecurring && debt?.totalAmount && debt?.installmentsQuantity
          ? Number((debt.totalAmount / debt.installmentsQuantity).toFixed(2))
          : (debt?.totalAmount ?? undefined),
      installmentsQuantity: debt?.installmentsQuantity ?? undefined,
      startDate: debt?.startDate
        ? debt.startDate.toISOString().split('T')[0]
        : '',
      description: debt?.description ?? '',
      isRecurring: debt?.isRecurring ?? false,
    },
  });

  const watchedPaymentMethod = form.watch('paymentMethod');
  const isCreditCard = watchedPaymentMethod === 'CREDIT_CARD';
  const watchedIsRecurring = form.watch('isRecurring');

  const watchedValues = form.watch([
    'totalAmount',
    'installmentsQuantity',
    'startDate',
    'cardId',
    'dueDay',
  ]);

  const [
    totalAmount,
    installmentsQuantity,
    startDate,
    selectedCardId,
    formDueDay,
  ] = watchedValues;
  const selectedCard = localCards.find((c) => c.id === selectedCardId);
  const previewDueDay = isCreditCard ? selectedCard?.dueDay : formDueDay;

  const preview = useMemo(
    () =>
      totalAmount && installmentsQuantity && startDate && previewDueDay
        ? generatePreview(
            totalAmount,
            installmentsQuantity,
            startDate,
            previewDueDay,
          )
        : [],
    [totalAmount, installmentsQuantity, startDate, previewDueDay],
  );

  const handleCreateCard = async () => {
    if (!newCardName || !newCardDueDay) return;
    setCreatingCard(true);
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCardName,
          dueDay: parseInt(newCardDueDay),
        }),
      });
      if (!res.ok) throw new Error('Erro ao criar cartão.');
      const card = await res.json();
      setLocalCards((prev) => [...prev, card]);
      form.setValue('cardId', card.id);
      setCardDialogOpen(false);
      setNewCardName('');
      setNewCardDueDay('');
      toast.success('Cartão criado!');
    } catch {
      toast.error('Erro ao criar cartão.');
    } finally {
      setCreatingCard(false);
    }
  };

  const handleCreateName = async () => {
    if (!newNameValue) return;
    setCreatingName(true);
    try {
      const res = await fetch('/api/names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newNameValue }),
      });
      if (!res.ok) throw new Error('Erro ao criar nome.');
      const name = await res.json();
      setLocalNames((prev) => [...prev, name]);
      form.setValue('personCompanyId', name.id);
      setNameDialogOpen(false);
      setNewNameValue('');
      toast.success('Nome criado!');
    } catch {
      toast.error('Erro ao criar nome.');
    } finally {
      setCreatingName(false);
    }
  };

  const handleCreateAsset = async () => {
    if (!newAssetName) return;
    setCreatingAsset(true);
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAssetName, emoji: newAssetEmoji }),
      });
      if (!res.ok) throw new Error('Erro ao criar bem/ativo.');
      const asset = await res.json();
      setLocalAssets((prev) => [...prev, asset]);
      form.setValue('assetId', asset.id);
      setAssetDialogOpen(false);
      setNewAssetName('');
      setNewAssetEmoji('📦');
      toast.success('Bem/Ativo criado!');
    } catch {
      toast.error('Erro ao criar bem/ativo.');
    } finally {
      setCreatingAsset(false);
    }
  };

  const onSubmit = async (data: DebtFormData) => {
    try {
      const url = debt ? `/api/debts/${debt.id}` : '/api/debts';
      const method = debt ? 'PUT' : 'POST';

      // For recurring debts, the user enters the monthly value.
      // totalAmount in DB = monthly value × installments
      const payload = { ...data };
      if (data.isRecurring && data.totalAmount && data.installmentsQuantity) {
        payload.totalAmount = Number(
          (data.totalAmount * data.installmentsQuantity).toFixed(2),
        );
      }

      // Default startDate to today if empty
      if (!payload.startDate) {
        const now = new Date();
        payload.startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
            {/* Payment Method */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pagamento</FormLabel>
                  <Select
                    onValueChange={(v) => {
                      field.onChange(v);
                      // Clear card when switching away from credit card
                      if (v !== 'CREDIT_CARD') {
                        form.setValue('cardId', '');
                      } else {
                        form.setValue('dueDay', undefined);
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o método" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method} value={method}>
                          {PAYMENT_METHOD_LABELS[method]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Card field - only shown for CREDIT_CARD */}
            {isCreditCard && (
              <FormField
                control={form.control}
                name="cardId"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Cartão</FormLabel>
                      <Dialog
                        open={cardDialogOpen}
                        onOpenChange={setCardDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                          >
                            <PlusCircle className="h-3 w-3 mr-1" />
                            Novo
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Novo Cartão</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-2">
                            <div className="grid gap-2">
                              <label className="text-sm font-medium">
                                Nome do Cartão
                              </label>
                              <Input
                                placeholder="Ex: Nubank"
                                value={newCardName}
                                onChange={(e) => setNewCardName(e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <label className="text-sm font-medium">
                                Dia de Vencimento
                              </label>
                              <Input
                                type="number"
                                min="1"
                                max="31"
                                placeholder="Ex: 10"
                                value={newCardDueDay}
                                onChange={(e) =>
                                  setNewCardDueDay(e.target.value)
                                }
                              />
                            </div>
                            <Button
                              type="button"
                              onClick={handleCreateCard}
                              disabled={creatingCard}
                            >
                              {creatingCard ? 'Criando...' : 'Criar Cartão'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cartão" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {localCards.map((card) => (
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
            )}

            {/* Due Day - only shown for non-card payment methods */}
            {!isCreditCard && (
              <FormField
                control={form.control}
                name="dueDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de Vencimento</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        placeholder="Ex: 15 (dia do mês)"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? undefined
                              : e.target.valueAsNumber,
                          )
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription>
                      Dia do mês em que o pagamento vence (1-31).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Person/Company field with inline creation */}
            <FormField
              control={form.control}
              name="personCompanyId"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Pessoa/Empresa</FormLabel>
                    <Dialog
                      open={nameDialogOpen}
                      onOpenChange={setNameDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                        >
                          <PlusCircle className="h-3 w-3 mr-1" />
                          Novo
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Nova Pessoa/Empresa</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-2">
                          <div className="grid gap-2">
                            <label className="text-sm font-medium">Nome</label>
                            <Input
                              placeholder="Ex: Amazon, João"
                              value={newNameValue}
                              onChange={(e) => setNewNameValue(e.target.value)}
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={handleCreateName}
                            disabled={creatingName}
                          >
                            {creatingName ? 'Criando...' : 'Criar Nome'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
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
                      {localNames.map((pc) => (
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

            {/* Category */}
            {categories.length > 0 && (
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria (Opcional)</FormLabel>
                    <Select
                      onValueChange={(v) =>
                        field.onChange(v === '__none__' ? null : v)
                      }
                      defaultValue={field.value || '__none__'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Sem Categoria</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.emoji} {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Asset (Bem/Ativo) */}
            <FormField
              control={form.control}
              name="assetId"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Bem/Ativo (Opcional)</FormLabel>
                    <Dialog
                      open={assetDialogOpen}
                      onOpenChange={setAssetDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                        >
                          <PlusCircle className="h-3 w-3 mr-1" />
                          Novo
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Novo Bem/Ativo</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-2">
                          <div className="grid gap-2">
                            <label className="text-sm font-medium">Ícone</label>
                            <div className="flex flex-wrap gap-2">
                              {[
                                '📦',
                                '🚗',
                                '🏠',
                                '🏍️',
                                '📱',
                                '💻',
                                '🎮',
                                '🔧',
                              ].map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => setNewAssetEmoji(emoji)}
                                  className={`text-xl p-1.5 rounded border-2 ${
                                    newAssetEmoji === emoji
                                      ? 'border-primary bg-primary/10'
                                      : 'border-transparent'
                                  }`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <label className="text-sm font-medium">Nome</label>
                            <Input
                              placeholder="Ex: HB20 2024"
                              value={newAssetName}
                              onChange={(e) => setNewAssetName(e.target.value)}
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={handleCreateAsset}
                            disabled={creatingAsset}
                          >
                            {creatingAsset ? 'Criando...' : 'Criar Bem/Ativo'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Select
                    onValueChange={(v) =>
                      field.onChange(v === '__none__' ? null : v)
                    }
                    defaultValue={field.value || '__none__'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Nenhum bem vinculado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">Sem Bem/Ativo</SelectItem>
                      {localAssets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.emoji} {asset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Vincule a um bem para agrupar dívidas relacionadas (ex:
                    Carro, Imóvel).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* isRecurring toggle */}
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
                          form.setValue('installmentsQuantity', 12);
                        }
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Dívida Recorrente</FormLabel>
                    <FormDescription>
                      Marque para assinaturas ou despesas mensais fixas (ex:
                      seguro, Netflix, aluguel). O sistema criará 12 parcelas
                      com o valor mensal informado.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {watchedIsRecurring
                      ? 'Valor Mensal'
                      : 'Valor Total da Dívida'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={
                        watchedIsRecurring ? 'Ex: 422.00' : 'Ex: 1200.50'
                      }
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

            {watchedIsRecurring ? (
              <div className="rounded-md border p-3 bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  📅 Serão criadas <strong>12 parcelas mensais</strong> com o
                  valor informado acima. Ao final dos 12 meses, você pode
                  duplicar ou criar uma nova dívida para renovar.
                </p>
                <input
                  type="hidden"
                  {...form.register('installmentsQuantity', {
                    valueAsNumber: true,
                  })}
                />
              </div>
            ) : (
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
            )}

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

            {/* Installment Preview (9.3) */}
            {preview.length > 0 && (
              <div className="border rounded-lg p-3">
                <h4 className="text-sm font-semibold mb-2">
                  Preview das Parcelas
                </h4>
                <div className="max-h-48 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Nº</TableHead>
                        <TableHead className="text-xs">Vencimento</TableHead>
                        <TableHead className="text-xs text-right">
                          Valor
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.map((inst) => (
                        <TableRow key={inst.number}>
                          <TableCell className="text-xs py-1">
                            {inst.number}/{preview.length}
                          </TableCell>
                          <TableCell className="text-xs py-1">
                            {format(inst.dueDate, 'dd/MM/yyyy', {
                              locale: ptBR,
                            })}
                          </TableCell>
                          <TableCell className="text-xs py-1 text-right">
                            {formatCurrency(inst.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {watchedIsRecurring
                    ? `12 meses de ${formatCurrency(preview[0]?.amount ?? 0)} = Total: ${formatCurrency(totalAmount * 12)}`
                    : `Total: ${formatCurrency(totalAmount)} em ${installmentsQuantity}x de ${formatCurrency(preview[0]?.amount ?? 0)}`}
                </p>
              </div>
            )}
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
