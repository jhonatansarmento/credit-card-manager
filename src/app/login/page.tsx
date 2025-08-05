'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
      <div className='w-full max-w-md'>
        {/* Logo/Brand Section */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4'>
            <svg
              className='w-8 h-8 text-white'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path d='M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z' />
            </svg>
          </div>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>
            Credit Card Manager
          </h1>
          <p className='text-gray-600'>
            Gerencie seus cartões de crédito de forma inteligente
          </p>
        </div>

        {/* Login Card */}
        <Card className='shadow-xl border-0 p-6'>
          <div className='text-center space-y-6'>
            <div>
              <h2 className='text-2xl font-semibold text-gray-800 mb-2'>
                Bem-vindo!
              </h2>
              <p className='text-gray-600'>
                Faça login para gerenciar seus cartões
              </p>
            </div>

            {/* Authentication Buttons */}
            <div className='space-y-3'>
              <SignedOut>
                <SignInButton mode='modal' fallbackRedirectUrl='/logado'>
                  <Button className='w-full bg-blue-600 hover:bg-blue-700 text-white'>
                    Entrar
                  </Button>
                </SignInButton>

                <SignUpButton mode='modal' fallbackRedirectUrl='/logado'>
                  <Button variant='outline' className='w-full'>
                    Criar Conta
                  </Button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <div className='text-center'>
                  <p className='text-green-600 mb-4'>Você já está logado!</p>
                  <Button
                    onClick={() => (window.location.href = '/logado')}
                    className='w-full bg-green-600 hover:bg-green-700 text-white'
                  >
                    Ir para Dashboard
                  </Button>
                </div>
              </SignedIn>
            </div>

            {/* Features Highlights */}
            <div className='text-left space-y-3'>
              <div className='flex items-center gap-3 text-sm text-gray-600'>
                <svg
                  className='w-4 h-4 text-green-600'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
                <span>Controle total dos seus gastos</span>
              </div>
              <div className='flex items-center gap-3 text-sm text-gray-600'>
                <svg
                  className='w-4 h-4 text-green-600'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
                <span>Relatórios detalhados</span>
              </div>
              <div className='flex items-center gap-3 text-sm text-gray-600'>
                <svg
                  className='w-4 h-4 text-green-600'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
                <span>Acesso seguro e privado</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className='text-center mt-6 text-sm text-gray-500'>
          <p>
            Ao continuar, você concorda com nossos{' '}
            <a href='#' className='text-blue-600 hover:underline'>
              Termos de Uso
            </a>{' '}
            e{' '}
            <a href='#' className='text-blue-600 hover:underline'>
              Política de Privacidade
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
