import { z } from 'zod';

export const PAYMENT_METHODS = [
  'CREDIT_CARD',
  'BOLETO',
  'DEBIT',
  'PIX',
  'TRANSFER',
  'CASH',
] as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CREDIT_CARD: 'Cartão de Crédito',
  BOLETO: 'Boleto',
  DEBIT: 'Débito em Conta',
  PIX: 'Pix',
  TRANSFER: 'Transferência',
  CASH: 'Dinheiro',
};

export const debtSchema = z
  .object({
    paymentMethod: z.enum(PAYMENT_METHODS).default('CREDIT_CARD'),
    cardId: z.string().nullish(),
    personCompanyId: z
      .string()
      .min(1, { message: 'Selecione uma pessoa/empresa.' }),
    categoryId: z.string().nullish(),
    assetId: z.string().nullish(),
    dueDay: z
      .number()
      .int()
      .min(1, { message: 'O dia deve ser entre 1 e 31.' })
      .max(31, { message: 'O dia deve ser entre 1 e 31.' })
      .nullish(),
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
      .refine((val) => val === '' || /^\d{4}-\d{2}-\d{2}$/.test(val), {
        message: 'Data inválida (AAAA-MM-DD).',
      })
      .default(''),
    description: z
      .string()
      .min(1, { message: 'A descrição é obrigatória.' })
      .max(500, {
        message: 'A descrição deve ter no máximo 500 caracteres.',
      }),
    isRecurring: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === 'CREDIT_CARD') {
      if (!data.cardId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Selecione um cartão.',
          path: ['cardId'],
        });
      }
    } else {
      if (!data.dueDay) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Informe o dia de vencimento.',
          path: ['dueDay'],
        });
      }
    }
  });

export type DebtFormData = z.input<typeof debtSchema>;
