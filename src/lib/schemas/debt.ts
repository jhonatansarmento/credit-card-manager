import { z } from 'zod';

export const debtSchema = z.object({
  cardId: z.string().min(1, { message: 'Selecione um cartão.' }),
  personCompanyId: z
    .string()
    .min(1, { message: 'Selecione uma pessoa/empresa.' }),
  totalAmount: z
    .number({ message: 'O valor total é obrigatório.' })
    .positive({ message: 'O valor total deve ser positivo.' }),
  installmentsQuantity: z
    .number({ message: 'A quantidade de parcelas é obrigatória.' })
    .int({ message: 'A quantidade de parcelas deve ser um número inteiro.' })
    .positive({ message: 'A quantidade de parcelas deve ser positiva.' }),
  startDate: z.string(),
  description: z.string().min(1, { message: 'A descrição é obrigatória.' }),
});

export type DebtFormData = z.infer<typeof debtSchema>;
