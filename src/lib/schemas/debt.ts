import { z } from 'zod';

export const debtSchema = z.object({
  cardId: z.string().min(1, { message: 'Selecione um cartão.' }),
  personCompanyId: z
    .string()
    .min(1, { message: 'Selecione uma pessoa/empresa.' }),
  totalAmount: z
    .number({ message: 'O valor total é obrigatório.' })
    .positive({ message: 'O valor total deve ser positivo.' })
    .max(9999999.99, { message: 'O valor máximo é R$ 9.999.999,99.' }),
  installmentsQuantity: z
    .number({ message: 'A quantidade de parcelas é obrigatória.' })
    .int({ message: 'A quantidade de parcelas deve ser um número inteiro.' })
    .positive({ message: 'A quantidade de parcelas deve ser positiva.' })
    .max(120, { message: 'O máximo de parcelas é 120.' }),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data inválida (AAAA-MM-DD).' }),
  description: z
    .string()
    .min(1, { message: 'A descrição é obrigatória.' })
    .max(500, { message: 'A descrição deve ter no máximo 500 caracteres.' }),
});

export type DebtFormData = z.infer<typeof debtSchema>;
