import { z } from 'zod';

export const personCompanySchema = z.object({
  name: z.string().min(1, { message: 'O nome é obrigatório.' }),
});

export type PersonCompanyFormData = z.infer<typeof personCompanySchema>;
