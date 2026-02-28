# Roadmap de Evolução — Credit Card Manager

> Documento gerado para rastrear o progresso do plano de evolução do projeto.
> Cada sprint lista suas tarefas com status: ✅ concluído | 🔲 pendente

---

## Sprint 1 — Correções Críticas ✅

> **Commit:** `b20b626` — _fix: sprint 1 critical fixes_

| #   | Tarefa                                                                                                 | Status |
| --- | ------------------------------------------------------------------------------------------------------ | ------ |
| 1.1 | Migrar campos monetários de `Float` para `Decimal(10,2)` (`totalAmount`, `installmentValue`, `amount`) | ✅     |
| 1.2 | Criar migration manual `20260226120000_float_to_decimal` (workaround para shadow DB)                   | ✅     |
| 1.3 | Converter `Decimal` → `Number()` em todas as exibições e props de componentes client                   | ✅     |
| 1.4 | Criar interface `SerializedDebt` no `debt-form.tsx` para aceitar números simples                       | ✅     |
| 1.5 | Preservar `isPaid` das parcelas ao editar dívida (via `paidMap` no `updateDebt`)                       | ✅     |
| 1.6 | Erro de signup: trocar `console.log` por `form.setError('root')` + banner vermelho                     | ✅     |
| 1.7 | Corrigir link de login no signup (`/` → `/login`)                                                      | ✅     |
| 1.8 | Remover `isLoading` morto no signup, usar `form.formState.isSubmitting`                                | ✅     |
| 1.9 | Reescrever `PROJETO.md` (remover referências ao Clerk, atualizar para better-auth)                     | ✅     |

---

## Sprint 2 — Arquitetura & Qualidade do Código ✅

> **Commit:** `22e7aee` — _refactor: sprint 2 - architecture and code quality improvements_

| #   | Tarefa                                                                                     | Status |
| --- | ------------------------------------------------------------------------------------------ | ------ |
| 2.1 | Criar route group `(authenticated)` com layout compartilhado (`Navbar` + `<main>`)         | ✅     |
| 2.2 | Remover wrappers de layout duplicados de todas as 10 páginas                               | ✅     |
| 2.3 | Substituir queries Prisma diretas por service layer em todas as páginas                    | ✅     |
| 2.4 | Adicionar `getDebt` no `debt.service.ts`                                                   | ✅     |
| 2.5 | Usar `Promise.all` para data fetching paralelo nas páginas                                 | ✅     |
| 2.6 | Criar schemas Zod compartilhados em `src/lib/schemas/` (credit-card, debt, person-company) | ✅     |
| 2.7 | Reescrever formulários CRUD com `react-hook-form` + `zodResolver`                          | ✅     |
| 2.8 | Extrair `GoogleIcon` duplicado para `src/components/icons/google-icon.tsx`                 | ✅     |
| 2.9 | Tipar `whereClause` com `Prisma.DebtWhereInput` (remover `any`)                            | ✅     |

---

## Sprint 3 — UX & Feedback Visual ✅

> **Commit:** `d441563` — _feat: sprint 3 - UX and feedback visual improvements_

| #   | Tarefa                                                                                                                       | Status |
| --- | ---------------------------------------------------------------------------------------------------------------------------- | ------ |
| 3.1 | Adicionar skeletons de loading nas listagens (cards, names, debts) usando `Suspense` + `loading.tsx` ou componentes skeleton | ✅     |
| 3.2 | Melhorar empty states com ilustrações/ícones e CTAs mais claros                                                              | ✅     |
| 3.3 | Adicionar indicador de parcelas pagas vs total em cada dívida (ex: "3/12 pagas")                                             | ✅     |
| 3.4 | Barra de progresso visual nas parcelas de cada dívida                                                                        | ✅     |
| 3.5 | Formatação de moeda brasileira (R$) nos valores monetários                                                                   | ✅     |
| 3.6 | Highlight visual na parcela do mês atual na tabela de parcelas                                                               | ✅     |
| 3.7 | Breadcrumbs nas páginas internas (edit, new)                                                                                 | ✅     |
| 3.8 | Feedback de "nenhum resultado" nos filtros de dívidas                                                                        | ✅     |

---

## Sprint 4 — Dashboard & Analytics ✅

> **Commit:** `2451487` — _feat: sprint 4 - dashboard and analytics_

| #   | Tarefa                                                                                                     | Status |
| --- | ---------------------------------------------------------------------------------------------------------- | ------ |
| 4.1 | Redesign da home (`/`) com cards de resumo: total de dívidas ativas, valor total pendente, parcelas do mês | ✅     |
| 4.2 | Total de gastos por cartão (card summary)                                                                  | ✅     |
| 4.3 | Total de gastos por pessoa/empresa                                                                         | ✅     |
| 4.4 | Gráfico de evolução mensal (parcelas pagas vs pendentes ao longo do tempo)                                 | ✅     |
| 4.5 | Lista de próximas parcelas a vencer (upcoming installments)                                                | ✅     |
| 4.6 | Percentual geral de quitação das dívidas                                                                   | ✅     |

---

## Sprint 5 — Segurança & Infraestrutura ✅

> **Commit:** `e67e434` — _feat: sprint 5 - security and infrastructure hardening_

| #   | Tarefa                                                                                           | Status |
| --- | ------------------------------------------------------------------------------------------------ | ------ |
| 5.1 | Validar body das API routes com schemas Zod compartilhados (reutilizar os de `src/lib/schemas/`) | ✅     |
| 5.2 | Rate limiting nas API routes (middleware customizado in-memory)                                  | ✅     |
| 5.3 | Sanitização de inputs (prevenir XSS)                                                             | ✅     |
| 5.4 | Headers de segurança (CSP, X-Frame-Options, etc.) no `next.config.ts`                            | ✅     |
| 5.5 | Logging estruturado de erros (substituir console.error por logger)                               | ✅     |
| 5.6 | Tratamento global de erros com `error.tsx` boundary pages                                        | ✅     |
| 5.7 | Página `not-found.tsx` customizada                                                               | ✅     |

---

## Sprint 6 — Features Avançadas ✅

> **Commit:** `19c3288` — _feat: sprint 6 - advanced features_

| #   | Tarefa                                                    | Status |
| --- | --------------------------------------------------------- | ------ |
| 6.1 | Exportar dívidas/parcelas em CSV                          | ✅     |
| 6.2 | Paginação nas listagens (debts, cards, names)             | ✅     |
| 6.3 | Ordenação nas tabelas (por nome, data, valor)             | ✅     |
| 6.4 | Busca por texto na listagem de dívidas (por descrição)    | ✅     |
| 6.5 | "Quitar todas as parcelas" de uma dívida de uma vez       | ✅     |
| 6.6 | Duplicar dívida (criar nova com mesmos dados)             | ✅     |
| 6.7 | Soft delete (arquivar dívidas quitadas em vez de excluir) | ✅     |
| 6.8 | PWA com notificações de parcelas próximas do vencimento   | ✅     |

---

## Sprint 7 — Correções & Polimento ✅

> **Commit:** `pendente` — _feat: sprint 7 - corrections and polish_

| #    | Tarefa                                                                                             | Status |
| ---- | -------------------------------------------------------------------------------------------------- | ------ |
| 7.1  | Corrigir arredondamento de parcelas (última parcela absorve centavos restantes)                    | ✅     |
| 7.2  | Adicionar índices no banco (Debt: userId+isArchived, cardId, personCompanyId; Installment: isPaid) | ✅     |
| 7.3  | Seção de parcelas vencidas no dashboard (overdue installments)                                     | ✅     |
| 7.4  | Toggle de tema claro/escuro com next-themes (ThemeProvider + ThemeToggle)                          | ✅     |
| 7.5  | Highlight de link ativo na navbar desktop (NavLinks client component)                              | ✅     |
| 7.6  | Colapsar parcelas na listagem de dívidas (mostrar 4, expandir sob demanda)                         | ✅     |
| 7.7  | Refatorar ações de dívida para DropdownMenu único (editar, duplicar, quitar, arquivar, excluir)    | ✅     |
| 7.8  | Hardening dos schemas Zod (max lengths, max parcelas 120, regex de data, max valor)                | ✅     |
| 7.9  | Migrar dashboard para agregações SQL via Prisma (remover loops in-memory)                          | ✅     |
| 7.10 | Exibir contagem de dívidas e valor pendente nas listagens de cartões e nomes                       | ✅     |

---

## Resumo de Progresso

| Sprint | Descrição                  | Tarefas | Status       |
| ------ | -------------------------- | ------- | ------------ |
| 1      | Correções Críticas         | 9/9     | ✅ Concluído |
| 2      | Arquitetura & Qualidade    | 9/9     | ✅ Concluído |
| 3      | UX & Feedback Visual       | 8/8     | ✅ Concluído |
| 4      | Dashboard & Analytics      | 6/6     | ✅ Concluído |
| 5      | Segurança & Infraestrutura | 7/7     | ✅ Concluído |
| 6      | Features Avançadas         | 8/8     | ✅ Concluído |
| 7      | Correções & Polimento      | 10/10   | ✅ Concluído |

**Total: 57/57 tarefas concluídas (100%)**

---

_Última atualização: 28/02/2026_
