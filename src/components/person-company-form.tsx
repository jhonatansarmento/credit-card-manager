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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  personCompanySchema,
  type PersonCompanyFormData,
} from '@/lib/schemas/person-company';
import type { PersonCompany as PersonCompanyType } from '@prisma/client';

interface PersonCompanyFormProps {
  personCompany?: PersonCompanyType;
}

export default function PersonCompanyForm({
  personCompany,
}: PersonCompanyFormProps) {
  const router = useRouter();

  const form = useForm<PersonCompanyFormData>({
    resolver: zodResolver(personCompanySchema),
    defaultValues: {
      name: personCompany?.name ?? '',
    },
  });

  const onSubmit = async (data: PersonCompanyFormData) => {
    try {
      const url = personCompany
        ? `/api/names/${personCompany.id}`
        : '/api/names';
      const method = personCompany ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Erro ao salvar o nome.');
      }

      toast.success(
        personCompany
          ? 'Nome atualizado com sucesso!'
          : 'Nome criado com sucesso!',
      );
      router.push('/names');
      router.refresh();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao salvar o nome.',
      );
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {personCompany ? 'Editar Nome' : 'Novo Nome (Pessoa/Empresa)'}
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João, Empresa X" {...field} />
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
              {form.formState.isSubmitting ? 'Salvando...' : 'Salvar Nome'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
