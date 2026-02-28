import { z } from 'zod';

export const personCompanySchema = z.object({
  name: z
    .string()
    .min(1, { message: 'O nome é obrigatório.' })
    .max(100, { message: 'O nome deve ter no máximo 100 caracteres.' }),
});

export type PersonCompanyFormData = z.infer<typeof personCompanySchema>;
