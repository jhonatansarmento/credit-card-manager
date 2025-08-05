import { Toaster } from '@/components/ui/sonner';
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import type React from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Controle de Dívidas',
  description: 'Gerencie seus cartões de crédito e dívidas.',
  generator: 'v0.dev',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang='pt-BR' suppressHydrationWarning>
        <body className='antialiased dark'>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
