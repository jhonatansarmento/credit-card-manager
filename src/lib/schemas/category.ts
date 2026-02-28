import { z } from 'zod';

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, { message: 'O nome da categoria é obrigatório.' })
    .max(50, { message: 'O nome deve ter no máximo 50 caracteres.' }),
  emoji: z
    .string()
    .max(10, { message: 'Emoji inválido.' })
    .optional()
    .default('📁'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, { message: 'Cor inválida (formato hex).' })
    .optional()
    .default('#6B7280'),
  parentId: z.string().nullish(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
