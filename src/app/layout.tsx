import { ClerkProvider } from '@clerk/nextjs';
import { type Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Credit Card Manager',
  description: 'Gerencie seus cartões de crédito de forma inteligente',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang='pt-br'>
        <body className={`antialiased`}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
