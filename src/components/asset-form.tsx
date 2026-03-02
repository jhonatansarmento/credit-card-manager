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
import { Textarea } from '@/components/ui/textarea';
import { assetSchema, type AssetFormData } from '@/lib/schemas/asset';
import type { Asset } from '@prisma/client';

const EMOJI_OPTIONS = [
  '📦',
  '🚗',
  '🏠',
  '🏍️',
  '🛵',
  '📱',
  '💻',
  '🎮',
  '🛋️',
  '🔧',
  '🎓',
  '✈️',
  '🏥',
  '🐕',
  '🎸',
  '🏋️',
];

interface AssetFormProps {
  asset?: Asset;
}

export default function AssetForm({ asset }: AssetFormProps) {
  const router = useRouter();

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: asset?.name ?? '',
      emoji: asset?.emoji ?? '📦',
      description: asset?.description ?? '',
    },
  });

  const onSubmit = async (data: AssetFormData) => {
    try {
      const url = asset ? `/api/assets/${asset.id}` : '/api/assets';
      const method = asset ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Erro ao salvar o bem/ativo.');
      }

      toast.success(
        asset
          ? 'Bem/Ativo atualizado com sucesso!'
          : 'Bem/Ativo criado com sucesso!',
      );
      router.push('/assets');
      router.refresh();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao salvar o bem/ativo.',
      );
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{asset ? 'Editar Bem/Ativo' : 'Novo Bem/Ativo'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="emoji"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => field.onChange(emoji)}
                        className={`text-2xl p-2 rounded-lg border-2 transition-colors ${
                          field.value === emoji
                            ? 'border-primary bg-primary/10'
                            : 'border-transparent hover:border-muted-foreground/30'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Bem/Ativo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: HB20 2024, Apartamento Centro"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Identifique o bem para agrupar suas dívidas relacionadas.
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
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Carro financiado em 48x pela BV Financeira"
                      rows={3}
                      {...field}
                      value={field.value ?? ''}
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
              {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
