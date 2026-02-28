'use client';

import { ThemeSelector } from '@/components/theme-selector';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Info, Palette, PlusCircle, Tag, Trash2, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface CategoryItem {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

interface SettingsContentProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  categories?: CategoryItem[];
}

const tabs = [
  { id: 'geral', label: 'Geral', icon: Palette },
  { id: 'categorias', label: 'Categorias', icon: Tag },
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

function CategoriesManager({
  initialCategories,
}: {
  initialCategories: CategoryItem[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('📁');
  const [newColor, setNewColor] = useState('#6B7280');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          emoji: newEmoji,
          color: newColor,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Erro ao criar categoria.');
      }
      const cat = await res.json();
      setCategories((prev) => [...prev, cat]);
      setDialogOpen(false);
      setNewName('');
      setNewEmoji('📁');
      setNewColor('#6B7280');
      toast.success('Categoria criada!');
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao criar categoria.',
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir categoria.');
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success('Categoria excluída!');
      router.refresh();
    } catch {
      toast.error('Erro ao excluir categoria.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Categorias</CardTitle>
            <CardDescription>
              Gerencie as categorias de despesas
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <PlusCircle className="h-4 w-4 mr-1" />
                Nova
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Categoria</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Nome</label>
                  <Input
                    placeholder="Ex: Alimentação"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Emoji</label>
                    <Input
                      placeholder="📁"
                      value={newEmoji}
                      onChange={(e) => setNewEmoji(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Cor</label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={handleCreate} disabled={creating}>
                  {creating ? 'Criando...' : 'Criar Categoria'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma categoria cadastrada
          </p>
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm font-medium">
                    {cat.emoji} {cat.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(cat.id)}
                  disabled={deletingId === cat.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SettingsContent({
  user,
  categories = [],
}: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState<TabId>('geral');

  return (
    <>
      <div className="max-w-2xl space-y-6">
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

        {/* Categorias */}
        {activeTab === 'categorias' && (
          <div className="space-y-4">
            <CategoriesManager initialCategories={categories} />
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
