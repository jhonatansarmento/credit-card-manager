import { z } from 'zod';

export const INCOME_TYPES = [
  'SALARY',
  'FREELANCE',
  'INVESTMENT',
  'RENTAL',
  'GIFT',
  'OTHER',
] as const;

export const INCOME_TYPE_LABELS: Record<string, string> = {
  SALARY: 'Salário',
  FREELANCE: 'Freelance',
  INVESTMENT: 'Investimento',
  RENTAL: 'Aluguel',
  GIFT: 'Presente',
  OTHER: 'Outro',
};

export const INCOME_TYPE_EMOJIS: Record<string, string> = {
  SALARY: '💼',
  FREELANCE: '💻',
  INVESTMENT: '📈',
  RENTAL: '🏠',
  GIFT: '🎁',
  OTHER: '💰',
};

export const incomeSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: 'O nome é obrigatório.' })
      .max(100, { message: 'O nome deve ter no máximo 100 caracteres.' }),
    description: z
      .string()
      .max(500, { message: 'A descrição deve ter no máximo 500 caracteres.' })
      .nullish(),
    amount: z
      .number({ message: 'O valor é obrigatório.' })
      .positive({ message: 'O valor deve ser positivo.' })
      .max(9999999.99, { message: 'O valor máximo é R$ 9.999.999,99.' }),
    incomeType: z.enum(INCOME_TYPES, {
      message: 'Selecione um tipo de provento.',
    }),
    isRecurring: z.boolean().default(false),
    receiveDay: z
      .number()
      .int()
      .min(1, { message: 'O dia deve ser entre 1 e 31.' })
      .max(31, { message: 'O dia deve ser entre 1 e 31.' })
      .nullish(),
    startDate: z
      .string()
      .refine((val) => val === '' || /^\d{4}-\d{2}-\d{2}$/.test(val), {
        message: 'Data inválida (AAAA-MM-DD).',
      })
      .default(''),
    endDate: z
      .string()
      .refine((val) => val === '' || /^\d{4}-\d{2}-\d{2}$/.test(val), {
        message: 'Data inválida (AAAA-MM-DD).',
      })
      .default(''),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring && !data.receiveDay) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Dia de recebimento é obrigatório para proventos recorrentes.',
        path: ['receiveDay'],
      });
    }
    if (data.endDate && data.startDate && data.endDate <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A data final deve ser posterior à data inicial.',
        path: ['endDate'],
      });
    }
  });

export type IncomeFormData = z.input<typeof incomeSchema>;
