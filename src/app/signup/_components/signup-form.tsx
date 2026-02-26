'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { FaGoogle } from 'react-icons/fa';

const signupSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
    email: z.string().email({ message: 'Email inválido' }),
    password: z
      .string()
      .min(8, { message: 'A senha deve ter pelo menos 8 caracteres' }),
    confirmPassword: z.string().min(8, {
      message: 'A confirmação de senha deve ter pelo menos 8 caracteres',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(formData: SignupFormValues) {
    const { data, error } = await authClient.signUp.email(
      {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        callbackURL: '/dashboard',
      },
      {
        onRequest: (ctx) => {},
        onSuccess: (ctx) => {
          console.log('Usuário cadastrado com sucesso:', ctx.data);
          setIsLoading(false);
          router.push('/dashboard');
        },
        onError: (ctx) => {
          console.log('Erro ao cadastrar:', ctx.error);
        },
      },
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input
                  placeholder='Seu nome completo'
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder='seu@email.com'
                  type='email'
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <div className='relative'>
                  <Input
                    placeholder='••••••••'
                    type={showPassword ? 'text' : 'password'}
                    {...field}
                    disabled={isLoading}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4 text-muted-foreground' />
                    ) : (
                      <Eye className='h-4 w-4 text-muted-foreground' />
                    )}
                    <span className='sr-only'>
                      {showPassword ? 'Esconder senha' : 'Mostrar senha'}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Senha</FormLabel>
              <FormControl>
                <div className='relative'>
                  <Input
                    placeholder='••••••••'
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...field}
                    disabled={isLoading}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className='h-4 w-4 text-muted-foreground' />
                    ) : (
                      <Eye className='h-4 w-4 text-muted-foreground' />
                    )}
                    <span className='sr-only'>
                      {showConfirmPassword ? 'Esconder senha' : 'Mostrar senha'}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className='w-full' disabled={isLoading}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Cadastrando...
            </>
          ) : (
            'Cadastrar'
          )}
        </Button>

        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-card px-2 text-muted-foreground'>
              ou continue com
            </span>
          </div>
        </div>

        <Button
          type='button'
          variant='outline'
          className='w-full'
          disabled={isLoading}
          onClick={() =>
            authClient.signIn.social({
              provider: 'google',
              callbackURL: '/',
            })
          }
        >
          <FaGoogle className='mr-2 h-4 w-4' />
          Google
        </Button>
      </form>
    </Form>
  );
}
