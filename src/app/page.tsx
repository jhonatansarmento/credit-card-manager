import { Button } from '@/components/ui/button';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  return (
    <div className='min-h-screen'>
      <SignedOut>
        {/* Página de boas-vindas para usuários não logados */}
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
          <div className='text-center max-w-2xl'>
            <div className='inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6'>
              <svg
                className='w-10 h-10 text-white'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path d='M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z' />
              </svg>
            </div>

            <h1 className='text-4xl font-bold text-gray-800 mb-4'>
              Credit Card Manager
            </h1>

            <p className='text-xl text-gray-600 mb-8'>
              Gerencie seus cartões de crédito de forma inteligente e organizada
            </p>

            <div className='space-y-4'>
              <Link href='/login'>
                <Button className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg'>
                  Começar Agora
                </Button>
              </Link>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-12'>
                <div className='text-center p-6'>
                  <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
                    <svg
                      className='w-6 h-6 text-green-600'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <h3 className='font-semibold text-gray-800 mb-2'>
                    Controle Total
                  </h3>
                  <p className='text-gray-600 text-sm'>
                    Acompanhe todos os seus gastos em tempo real
                  </p>
                </div>

                <div className='text-center p-6'>
                  <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
                    <svg
                      className='w-6 h-6 text-blue-600'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                  <h3 className='font-semibold text-gray-800 mb-2'>
                    Segurança
                  </h3>
                  <p className='text-gray-600 text-sm'>
                    Seus dados protegidos com criptografia avançada
                  </p>
                </div>

                <div className='text-center p-6'>
                  <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
                    <svg
                      className='w-6 h-6 text-purple-600'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z' />
                    </svg>
                  </div>
                  <h3 className='font-semibold text-gray-800 mb-2'>
                    Relatórios
                  </h3>
                  <p className='text-gray-600 text-sm'>
                    Relatórios detalhados para análise financeira
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        {/* Redirecionar usuários logados para o dashboard */}
        <div className='min-h-screen flex items-center justify-center'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-gray-800 mb-4'>
              Redirecionando para o dashboard...
            </h1>
            <Link href='/logado'>
              <Button>Ir para Dashboard</Button>
            </Link>
          </div>
        </div>
      </SignedIn>
    </div>
  );
}
