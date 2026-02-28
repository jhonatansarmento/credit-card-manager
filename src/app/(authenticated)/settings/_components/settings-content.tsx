'use client';

import { ThemeSelector } from '@/components/theme-selector';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Info, Palette, User } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface SettingsContentProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

const tabs = [
  { id: 'geral', label: 'Geral', icon: Palette },
  { id: 'conta', label: 'Conta', icon: User },
  { id: 'sobre', label: 'Sobre', icon: Info },
] as const;

type TabId = (typeof tabs)[number]['id'];

function UserAvatar({ name, image }: { name: string; image?: string | null }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (image) {
    return (
      <Image
        src={image}
        alt={name}
        width={64}
        height={64}
        className="h-16 w-16 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-semibold">
      {initials}
    </div>
  );
}

export function SettingsContent({ user }: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState<TabId>('geral');

  return (
    <>
      <h1 className="text-3xl font-bold">Configurações</h1>

      <div className="max-w-2xl space-y-6 mt-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Geral */}
        {activeTab === 'geral' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Aparência</CardTitle>
                <CardDescription>
                  Escolha como o aplicativo deve ser exibido
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ThemeSelector />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Conta */}
        {activeTab === 'conta' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Perfil</CardTitle>
                <CardDescription>Informações da sua conta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <UserAvatar name={user.name} image={user.image} />
                  <div className="min-w-0">
                    <p className="text-lg font-semibold truncate">
                      {user.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sobre */}
        {activeTab === 'sobre' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Controle de Dívidas</CardTitle>
                <CardDescription>
                  Gerencie seus cartões de crédito e dívidas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Versão</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Desenvolvido por
                  </span>
                  <a
                    href="https://github.com/jhonatansarmento"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    Jhonatan Sarmento
                  </a>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Código fonte</span>
                  <a
                    href="https://github.com/jhonatansarmento/credit-card-manager"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    GitHub
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
