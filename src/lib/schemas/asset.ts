import { z } from 'zod';

export const assetSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'O nome é obrigatório.' })
    .max(100, { message: 'O nome deve ter no máximo 100 caracteres.' }),
  emoji: z.string().default('📦'),
  description: z
    .string()
    .max(500, { message: 'A descrição deve ter no máximo 500 caracteres.' })
    .nullish(),
});

export type AssetFormData = z.input<typeof assetSchema>;
