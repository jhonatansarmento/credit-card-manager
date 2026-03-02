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

> **Commit:** `17d6be0` — _feat: sprint 7 - corrections and polish_

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

## Sprint 8 — Sidebar & Settings ✅

> **Commit:** `04ea020` + `0aabf7f` — _feat: sprint 8 - sidebar & settings redesign_
>
> Redesign da navegação: trocar a navbar horizontal por uma **sidebar vertical fixa** (estilo Visor Finance),
> com seções agrupadas, perfil do usuário na parte inferior e modal de configurações.

| #    | Tarefa                                                                                                                                                                                                     | Status |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 8.1  | Criar componente `Sidebar` vertical fixa à esquerda — logo no topo, links agrupados por seção ("Organização": Início, Dívidas; "Controle": Cartões, Nomes), ícones Lucide + texto, highlight do link ativo | ✅     |
| 8.2  | Card de perfil do usuário na parte inferior da sidebar — avatar (iniciais ou imagem), nome, email truncado, clicável para abrir configurações                                                              | ✅     |
| 8.3  | Sidebar collapsible — modo compacto (somente ícones, ~64px) com botão toggle; salvar preferência no `localStorage`                                                                                         | ✅     |
| 8.4  | Mobile: sidebar em drawer (slide-in da esquerda) com overlay, substituindo o menu hamburger atual; fechar ao navegar ou clicar fora                                                                        | ✅     |
| 8.5  | Modal/página de Configurações (`/settings`) com abas: **Geral** (aparência claro/escuro/sistema, idioma futuro), **Conta** (nome, email, avatar, trocar senha), **Sobre** (versão do app, link GitHub)     | ✅     |
| 8.6  | Mover `ThemeToggle` para dentro das Configurações > Geral — seletor de 3 opções (Claro / Sistema / Escuro) como segmented control, estilo Visor                                                            | ✅     |
| 8.7  | Botão de `SignOut` na sidebar inferior (abaixo do perfil) ou dentro do menu de perfil como dropdown com opções: "Configurações", "Sair"                                                                    | ✅     |
| 8.8  | Atualizar `layout.tsx` do `(authenticated)` — layout flex horizontal (`sidebar + main`), remover `<Navbar>`, ajustar padding do `<main>` para compensar largura da sidebar                                 | ✅     |
| 8.9  | Migrar breadcrumbs e título da página para um header bar dentro do `<main>` (ex: "Dashboard", "Dívidas") com botão toggle da sidebar à esquerda, similar ao header do Visor                                | ✅     |
| 8.10 | Remover componentes obsoletos (`navbar.tsx`, `nav-links.tsx`, `mobile-menu.tsx`) e atualizar todas as referências                                                                                          | ✅     |

---

## Sprint 9 — Features de Produto ✅

> **Commit:** `dba9086` — _feat: sprint 9 - product features - categories, debt detail, batch actions, charts_

| #    | Tarefa                                                                                                                                                                                                             | Status |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| 9.1  | Página de detalhe da dívida (`/debts/[id]`) — timeline visual de pagamentos agrupada por mês (estilo Visor Recorrentes), com progresso da parcela (ex: "3/12"), badges de status e link para edição rápida         | ✅     |
| 9.2  | Filtro de período no dashboard — navegador "◄ Fevereiro 2026 ►" nos gráficos + cards com **variação % vs mês anterior** (ex: "+32.2%" verde/vermelho, inspirado no Ritmo de Gastos do Visor)                       | ✅     |
| 9.3  | Preview de parcelas antes de criar dívida — tabela prévia com datas, valores e número de cada parcela que será gerada, similar à seção "Parcelamentos" da Projeção do Visor                                        | ✅     |
| 9.4  | Sistema de categorias nas dívidas com emojis e hierarquia (ex: 🛍️ Compras → 📚 Livraria, 💻 Eletrônicos) — migration, CRUD de categorias, filtro, badge colorido e regras simples de auto-categorização            | ✅     |
| 9.5  | Criação inline de cartão/nome dentro do formulário de dívida (dialog/popover sem navegar para outra página)                                                                                                        | ✅     |
| 9.6  | Campo `closingDay` no cartão + resumo de fatura por cartão — card mostrando total da fatura do ciclo atual com contagem de parcelas e compras (ex: "R$ 3.302,40 — 17 parcelas · 18 compras", estilo Faturas Visor) | ✅     |
| 9.7  | Gráfico donut de distribuição de gastos por categoria no dashboard (recharts `PieChart`) com breakdown de valores e percentuais, inspirado na página Relatórios do Visor                                           | ✅     |
| 9.8  | Dívidas recorrentes — modelo para assinaturas que se renovam automaticamente, com seção separada na listagem e badge "Recorrente"                                                                                  | ✅     |
| 9.9  | Ação em lote na listagem de dívidas: selecionar múltiplas via checkbox e arquivar/quitar todas de uma vez                                                                                                          | ✅     |
| 9.10 | Relatório mensal (`/reports`) — donut de categorias + resultado parcial (receita vs gasto) + **diagrama Sankey** de fluxo de gastos (Cartão → Categoria → Subcategoria, recharts Sankey), exportável em CSV        | ✅     |
| 9.11 | Projeção de quitação — gráfico de barras mostrando parcelas futuras mês a mês com linha pontilhada de saldo projetado, indicando quando cada dívida será quitada (inspirado na Projeção do Visor)                  | ✅     |
| 9.12 | Valores coloridos na listagem — verde para parcelas pagas, vermelho para vencidas, cinza para futuras + resumo no topo da listagem (total pago / total pendente / total vencido)                                   | ✅     |

---

---

## Sprint 10 — Proventos & Fluxo de Caixa ✅

> **Commit:** `80e26ed` — _feat: add Income module, Cash Flow page, and dashboard balance section_
>
> Rastreamento de receitas (salário, freelance, investimentos, etc.) com lançamentos mensais
> e página dedicada de fluxo de caixa comparando receita vs despesa.

### Decisões de Design

- **Modelo de dados**: `Income` (provento) + `IncomeEntry` (lançamento mensal), similar a `Debt` + `Installment`
- **IncomeType enum fixo**: `SALARY`, `FREELANCE`, `INVESTMENT`, `RENTAL`, `GIFT`, `OTHER` — sem CRUD extra de categorias
- **Geração sob demanda (rolling)**: entries para proventos recorrentes são gerados ao acessar a listagem (mês atual + 3 meses à frente). `ensureEntries()` é idempotente via unique constraint `[incomeId, referenceMonth]`
- **Sem data limite para recorrentes**: salário e similares não têm `endDate` — projeção futura usa o valor cadastrado enquanto ativo
- **Sem PersonCompany**: proventos não vinculam a pessoa/empresa
- **Sem PaymentMethod**: apenas descrição textual livre
- **Visualização**: cards resumo no dashboard existente + página dedicada `/cash-flow` com gráficos detalhados
- **Gráfico**: `ComposedChart` do recharts — barras verdes (receita), barras vermelhas (despesa), linha azul (saldo acumulado). Meses futuros com opacidade reduzida

| #     | Tarefa                                                                                                                                                                                                   | Status |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 10.1  | Enum `IncomeType` + Model `Income` (name, amount, incomeType, isRecurring, receiveDay, startDate, endDate?, isArchived) + Model `IncomeEntry` (referenceMonth, amount, isReceived, receivedAt) no Prisma | ✅     |
| 10.2  | Migration SQL manual `20260302120000_add_incomes` (padrão Neon — sem shadow DB)                                                                                                                          | ✅     |
| 10.3  | Schema Zod `incomeSchema` com `INCOME_TYPES`, `INCOME_TYPE_LABELS`, superRefine para receiveDay obrigatório quando isRecurring                                                                           | ✅     |
| 10.4  | Service layer `income.service.ts`: CRUD + `ensureEntries()` (geração sob demanda) + `toggleEntryReceived` + `getIncomesSummary` + `getMonthlyCashFlow`                                                   | ✅     |
| 10.5  | API routes: `/api/incomes` (GET, POST), `/api/incomes/[id]` (PUT, DELETE), `/api/incomes/entries/[id]/toggle` (PATCH)                                                                                    | ✅     |
| 10.6  | Formulário `income-form.tsx`: name, incomeType (Select), amount, isRecurring (Switch), receiveDay (condicional), startDate, endDate (condicional), description                                           | ✅     |
| 10.7  | Páginas CRUD `/incomes`: listagem com tabela/cards + badge de tipo + toggle recebido inline, `/incomes/new`, `/incomes/[id]` (detalhe), `/incomes/[id]/edit`                                             | ✅     |
| 10.8  | Página `/cash-flow`: cards resumo (receita, despesa, saldo, acumulado) + gráfico `ComposedChart` + tabela mensal com cores condicionais                                                                  | ✅     |
| 10.9  | Componente `cash-flow-chart.tsx`: Bar verde (receita) + Bar vermelha (despesa) + Line azul (saldo acumulado), meses futuros com opacidade reduzida                                                       | ✅     |
| 10.10 | Dashboard: card "Receita do Mês" + seção "Balanço do Mês" (receita vs despesa visual) + link para `/cash-flow`                                                                                           | ✅     |
| 10.11 | Sidebar: links "Proventos" (TrendingUp) e "Fluxo de Caixa" (ArrowLeftRight) na seção Organização                                                                                                         | ✅     |
| 10.12 | Middleware: proteger rotas `/incomes` e `/cash-flow`                                                                                                                                                     | ✅     |

---

## Sprint 10b — Otimização do Dashboard 🔲

> Revisão do dashboard para remover redundâncias, corrigir cálculos e priorizar informações acionáveis.

### Problemas Identificados

- **Cálculo de despesa no Balanço incorreto**: usava média aproximada (`installmentsDueThisMonth * (totalPending / activeDebts)`) em vez do valor real das parcelas do mês
- **"Faturas Atuais" e "Gastos por Cartão" redundantes**: ambos exibem dados financeiros agrupados por cartão
- **"Evolução Mensal" e "Projeção de Gastos" sobrepostos**: dois gráficos separados para timeline financeira quando um só é suficiente
- **"Gastos por Pessoa/Empresa"**: informação secundária, já disponível via filtros em `/debts`
- **"Parcelas Vencidas" no final**: item mais urgente/acionável deveria ter prioridade visual
- **11 queries paralelas + 6 sequenciais internas**: ~17 queries por page load
- **867 linhas em um arquivo**: dificulta manutenção

### Layout Otimizado (de → para)

1. Summary Cards (4 KPIs)
2. ~~Balanço do Mês~~ → Parcelas Vencidas (urgente, borda vermelha) — subiu de posição
3. Balanço do Mês (corrigido com valor real)
4. ~~Gastos por Cartão + Gastos por Pessoa~~ → Gastos por Cartão + Gastos por Categoria
5. Gastos por Bem/Ativo (condicional)
6. ~~Evolução Mensal + Projeção~~ → Gráfico Unificado (passado + futuro em timeline única)
7. Próximas Parcelas

**Resultado**: 9 seções → 7, -3 queries removidas, -2 seções redundantes, cálculos corrigidos

| #     | Tarefa                                                                                                                                                  | Status |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 10b.1 | Adicionar `amountDueThisMonth` ao `getDashboardSummary()` — soma real das parcelas do mês (não mais média)                                              | 🔲     |
| 10b.2 | Corrigir seção "Balanço do Mês" para usar `amountDueThisMonth` em vez de cálculo aproximado                                                             | 🔲     |
| 10b.3 | Remover seção "Gastos por Pessoa/Empresa" do dashboard (manter função no service para uso futuro)                                                       | 🔲     |
| 10b.4 | Remover seção "Faturas Atuais" do dashboard (manter função no service para uso futuro)                                                                  | 🔲     |
| 10b.5 | Criar `FinancialTimelineChart` — gráfico unificado com evolução histórica + projeção futura, barra divisória no mês atual, opacidade reduzida no futuro | 🔲     |
| 10b.6 | Substituir `MonthlyEvolutionChart` + `ProjectionChart` pelo `FinancialTimelineChart` no dashboard                                                       | 🔲     |
| 10b.7 | Mover seção "Parcelas Vencidas" para logo após os Summary Cards (antes do Balanço)                                                                      | 🔲     |
| 10b.8 | Limpar imports e queries não utilizadas, verificar build                                                                                                | 🔲     |

---

## Sprint 11 — Segurança & Autenticação 🔲

| #    | Tarefa                                                                                                                                                              | Status |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 11.1 | Fluxo de "esqueci minha senha" (reset por email via better-auth `forgetPassword` plugin)                                                                            | 🔲     |
| 11.2 | Verificação de email obrigatória (o campo `emailVerified` existe mas não é usado)                                                                                   | 🔲     |
| 11.3 | Página de perfil do usuário (`/settings/account`) — editar nome, email, avatar e trocar senha (integração com better-auth), acessível via sidebar                   | 🔲     |
| 11.4 | Deleção de conta pelo próprio usuário com confirmação por senha e exclusão em cascata de todos os dados                                                             | 🔲     |
| 11.5 | Gerenciamento de sessões — ver e revogar sessões ativas (listar dispositivos/IPs com botão "Encerrar sessão")                                                       | 🔲     |
| 11.6 | Validação de variáveis de ambiente com Zod no startup (t3-env)                                                                                                      | 🔲     |
| 11.7 | Rate limiter com Redis/Vercel KV (substituir in-memory que não funciona em serverless)                                                                              | 🔲     |
| 11.8 | Notificação in-app (banner/toast) ao fazer login se houver parcelas vencidas, com link direto para a seção de vencidas                                              | 🔲     |
| 11.9 | Limites de gasto por cartão e/ou categoria — campo `spendingLimit` no cartão/categoria com alerta visual quando atingir 80%/100% (barra de progresso, estilo Visor) | 🔲     |

---

## Sprint 12 — Testes, Performance & DX 🔲

| #     | Tarefa                                                                                                                                           | Status |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| 12.1  | Configurar Vitest + React Testing Library (`vitest.config.ts`, scripts `test` e `test:watch` no `package.json`)                                  | 🔲     |
| 12.2  | Testes unitários dos services: `credit-card`, `name`, `debt` (`buildInstallments`, `duplicateDebt`, `exportDebtsCSV`)                            | 🔲     |
| 12.3  | Testes dos schemas Zod e utilitários (`formatCurrency`, `sanitizeObject`, `rateLimit`, `parseBody`)                                              | 🔲     |
| 12.4  | Configurar Playwright para E2E — fluxo de login, criação de cartão, criação de dívida e toggle de parcela                                        | 🔲     |
| 12.5  | CI/CD pipeline no GitHub Actions: lint, type-check, testes unitários, build em cada PR                                                           | 🔲     |
| 12.6  | Seed script do Prisma para dados de desenvolvimento (`prisma/seed.ts`) com cenários variados (dívidas quitadas, parciais, vencidas, recorrentes) | 🔲     |
| 12.7  | Extrair tipos compartilhados (`DebtWithRelations`, `CreditCardWithCounts`, `CategoryWithEmoji`) para `src/lib/types.ts`                          | 🔲     |
| 12.8  | Lazy load do `recharts` e `Sankey` via `next/dynamic` com `ssr: false` + debounce no campo de busca do `DebtFilters` (300ms)                     | 🔲     |
| 12.9  | Responsividade aprimorada: converter tabelas de cartões e nomes para layout de cards empilhados em telas `< md`                                  | 🔲     |
| 12.10 | Auditoria de acessibilidade: `aria-label`, `focus-visible`, skip-to-content link, `aria-live` nos feedbacks dinâmicos                            | 🔲     |

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
| 8      | Sidebar & Settings         | 10/10   | ✅ Concluído |
| 9      | Features de Produto        | 12/12   | ✅ Concluído |
| 10     | Proventos & Fluxo de Caixa | 12/12   | ✅ Concluído |
| 10b    | Otimização do Dashboard    | 0/8     | 🔲 Pendente  |
| 11     | Segurança & Autenticação   | 0/9     | 🔲 Pendente  |
| 12     | Testes, Performance & DX   | 0/10    | 🔲 Pendente  |

**Total: 91/118 tarefas concluídas (77%)**

---

_Última atualização: 02/03/2026_
