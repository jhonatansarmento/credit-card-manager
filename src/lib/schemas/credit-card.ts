import { z } from 'zod';

export const creditCardSchema = z.object({
  name: z.string().min(1, { message: 'O nome do cartão é obrigatório.' }),
  dueDay: z
    .number({ message: 'O dia de vencimento é obrigatório.' })
    .int({ message: 'O dia de vencimento deve ser um número inteiro.' })
    .min(1, { message: 'O dia de vencimento deve ser entre 1 e 31.' })
    .max(31, { message: 'O dia de vencimento deve ser entre 1 e 31.' }),
});

export type CreditCardFormData = z.infer<typeof creditCardSchema>;
