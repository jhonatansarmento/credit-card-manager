'use client';

import type React from 'react';

import { createPersonCompany, updatePersonCompany } from '@/app/names/actions';
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
import type { PersonCompany as PersonCompanyType } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface PersonCompanyFormProps {
  personCompany?: PersonCompanyType; // Opcional, para edição
}

export default function PersonCompanyForm({
  personCompany,
}: PersonCompanyFormProps) {
  const [name, setName] = useState(personCompany?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    try {
      if (personCompany) {
        await updatePersonCompany(personCompany.id, formData);
        toast.success('Nome atualizado com sucesso!');
      } else {
        await createPersonCompany(formData);
        toast.success('Nome criado com sucesso!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Ocorreu um erro ao salvar o nome.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle>
          {personCompany ? 'Editar Nome' : 'Novo Nome (Pessoa/Empresa)'}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className='grid gap-4'>
          <div className='grid gap-2'>
            <Label htmlFor='name'>Nome</Label>
            <Input
              id='name'
              name='name'
              placeholder='Ex: João, Empresa X'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className='flex justify-between'>
          <Button
            variant='outline'
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar Nome'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
