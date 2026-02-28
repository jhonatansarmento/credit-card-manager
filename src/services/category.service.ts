import prisma from '@/lib/db';

export interface CategoryPayload {
  name: string;
  emoji?: string;
  color?: string;
  parentId?: string | null;
}

export async function listCategories(userId: string) {
  return prisma.category.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
    include: {
      parent: { select: { id: true, name: true, emoji: true } },
      children: { select: { id: true, name: true, emoji: true } },
      _count: { select: { debts: true } },
    },
  });
}

export async function getCategory(id: string, userId: string) {
  return prisma.category.findUnique({
    where: { id, userId },
    include: {
      parent: { select: { id: true, name: true, emoji: true } },
      children: { select: { id: true, name: true, emoji: true } },
    },
  });
}

export async function createCategory(userId: string, data: CategoryPayload) {
  if (!data.name) {
    throw new Error('Nome da categoria é obrigatório.');
  }

  if (data.parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: data.parentId, userId },
    });
    if (!parent) {
      throw new Error('Categoria pai não encontrada.');
    }
  }

  try {
    return await prisma.category.create({
      data: {
        userId,
        name: data.name,
        emoji: data.emoji || '📁',
        color: data.color || '#6B7280',
        parentId: data.parentId || null,
      },
    });
  } catch {
    throw new Error(
      'Falha ao criar categoria. Certifique-se de que o nome é único.',
    );
  }
}

export async function updateCategory(
  id: string,
  userId: string,
  data: CategoryPayload,
) {
  if (!data.name) {
    throw new Error('Nome da categoria é obrigatório.');
  }

  if (data.parentId === id) {
    throw new Error('Uma categoria não pode ser pai de si mesma.');
  }

  if (data.parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: data.parentId, userId },
    });
    if (!parent) {
      throw new Error('Categoria pai não encontrada.');
    }
  }

  try {
    return await prisma.category.update({
      where: { id, userId },
      data: {
        name: data.name,
        emoji: data.emoji || '📁',
        color: data.color || '#6B7280',
        parentId: data.parentId ?? null,
      },
    });
  } catch {
    throw new Error(
      'Falha ao atualizar categoria. Certifique-se de que o nome é único.',
    );
  }
}

export async function deleteCategory(id: string, userId: string) {
  try {
    await prisma.category.delete({ where: { id, userId } });
  } catch {
    throw new Error('Falha ao excluir categoria.');
  }
}

/**
 * Default categories with emojis for auto-seeding on first use.
 */
export const DEFAULT_CATEGORIES: CategoryPayload[] = [
  { name: 'Compras', emoji: '🛍️', color: '#8B5CF6' },
  { name: 'Alimentação', emoji: '🍔', color: '#F59E0B' },
  { name: 'Transporte', emoji: '🚗', color: '#3B82F6' },
  { name: 'Saúde', emoji: '🏥', color: '#EF4444' },
  { name: 'Educação', emoji: '📚', color: '#10B981' },
  { name: 'Lazer', emoji: '🎮', color: '#EC4899' },
  { name: 'Moradia', emoji: '🏠', color: '#6366F1' },
  { name: 'Eletrônicos', emoji: '💻', color: '#14B8A6' },
  { name: 'Vestuário', emoji: '👕', color: '#F97316' },
  { name: 'Assinaturas', emoji: '📺', color: '#A855F7' },
  { name: 'Viagem', emoji: '✈️', color: '#06B6D4' },
  { name: 'Outros', emoji: '📦', color: '#6B7280' },
];

export async function seedDefaultCategories(userId: string) {
  const existing = await prisma.category.count({ where: { userId } });
  if (existing > 0) return;

  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((cat) => ({
      userId,
      name: cat.name,
      emoji: cat.emoji || '📁',
      color: cat.color || '#6B7280',
    })),
    skipDuplicates: true,
  });
}

/**
 * Simple auto-categorization based on description keywords.
 */
export function suggestCategory(
  description: string,
  categories: { id: string; name: string }[],
): string | null {
  const lower = description.toLowerCase();

  const rules: Record<string, string[]> = {
    Alimentação: [
      'comida',
      'restaurante',
      'lanche',
      'ifood',
      'mercado',
      'supermercado',
      'padaria',
      'pizza',
      'hamburguer',
    ],
    Transporte: [
      'uber',
      'combustível',
      'gasolina',
      'estacionamento',
      '99',
      'ônibus',
      'metrô',
      'pedágio',
    ],
    Saúde: [
      'farmácia',
      'hospital',
      'médico',
      'dentista',
      'consulta',
      'exame',
      'remédio',
    ],
    Educação: [
      'curso',
      'livro',
      'escola',
      'faculdade',
      'udemy',
      'alura',
      'mensalidade',
    ],
    Eletrônicos: [
      'notebook',
      'celular',
      'fone',
      'iphone',
      'samsung',
      'computador',
      'monitor',
      'teclado',
      'mouse',
    ],
    Vestuário: [
      'roupa',
      'sapato',
      'tênis',
      'camisa',
      'calça',
      'vestido',
      'blusa',
    ],
    Assinaturas: [
      'netflix',
      'spotify',
      'amazon prime',
      'disney',
      'hbo',
      'youtube',
      'apple',
    ],
    Viagem: ['hotel', 'passagem', 'airbnb', 'viagem', 'voo'],
    Lazer: ['cinema', 'show', 'jogo', 'ingresso', 'parque', 'festa'],
    Moradia: ['aluguel', 'condomínio', 'luz', 'água', 'internet', 'gás'],
    Compras: ['loja', 'shopping', 'presente', 'compra'],
  };

  for (const [categoryName, keywords] of Object.entries(rules)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      const match = categories.find((c) => c.name === categoryName);
      if (match) return match.id;
    }
  }

  return null;
}
