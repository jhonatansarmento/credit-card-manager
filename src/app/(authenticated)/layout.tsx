import { AppSidebar, SidebarProvider } from '@/components/app-sidebar';
import InstallmentNotifier from '@/components/installment-notifier';
import { SidebarMainContent } from '@/components/sidebar-main-content';
import { getAuthSession } from '@/lib/auth-session';
import type React from 'react';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  const user = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <AppSidebar user={user} />
        <SidebarMainContent>{children}</SidebarMainContent>
      </div>
      <InstallmentNotifier />
    </SidebarProvider>
  );
}
