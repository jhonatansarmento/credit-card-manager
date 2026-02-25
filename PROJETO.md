# Controle de Dívidas - Documentação do Projeto

## 1. Visão Geral

Aplicação web para **gerenciamento de dívidas em cartões de crédito**, permitindo ao usuário cadastrar cartões, pessoas/empresas associadas e registrar dívidas parceladas com controle individual de cada parcela.

### Stack Tecnológica

| Camada         | Tecnologia                             |
| -------------- | -------------------------------------- |
| Framework      | **Next.js 15.4** (App Router, RSC)     |
| Linguagem      | TypeScript 5                           |
| Autenticação   | **Clerk** (@clerk/nextjs)              |
| Banco de Dados | **PostgreSQL** via Prisma ORM 6        |
| UI             | **Tailwind CSS 4** + shadcn/ui + Radix |
| Notificações   | Sonner (toast)                         |
| Datas          | date-fns                               |

---

## 2. Modelo de Dados (Prisma)

```
User (1) ──→ (N) CreditCard
User (1) ──→ (N) PersonCompany
User (1) ──→ (N) Debt
CreditCard (1) ──→ (N) Debt
PersonCompany (1) ──→ (N) Debt
Debt (1) ──→ (N) Installment
```

| Entidade          | Campos principais                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| **User**          | id (Clerk ID), email, name                                                                           |
| **CreditCard**    | name, dueDay (1-31). Unique por (userId, name)                                                       |
| **PersonCompany** | name. Unique por (userId, name)                                                                      |
| **Debt**          | cardId, personCompanyId, totalAmount, installmentsQuantity, installmentValue, startDate, description |
| **Installment**   | debtId, installmentNumber, dueDate, amount, isPaid                                                   |

---

## 3. Features Já Implementadas ✅

### 3.1 Autenticação

- [x] Login/Logout via **Clerk** (Google OAuth)
- [x] Middleware de proteção de rotas (`clerkMiddleware`)
- [x] Verificação de `userId` em todas as Server Actions
- [x] Componente `UserButton` na navbar

### 3.2 Cartões de Crédito (`/cards`)

- [x] **Listar** cartões do usuário (tabela com nome e dia de vencimento)
- [x] **Criar** novo cartão (nome + dia de vencimento)
- [x] **Editar** cartão existente
- [x] **Excluir** cartão (com verificação de dívidas associadas)
- [x] Validação de nome único por usuário

### 3.3 Pessoas/Empresas (`/names`)

- [x] **Listar** pessoas/empresas do usuário
- [x] **Criar** nova pessoa/empresa
- [x] **Editar** pessoa/empresa existente
- [x] **Excluir** pessoa/empresa (com verificação de dívidas associadas)
- [x] Validação de nome único por usuário

### 3.4 Dívidas (`/debts`)

- [x] **Listar** todas as dívidas com detalhes
- [x] **Criar** nova dívida (selecionar cartão, pessoa/empresa, valor total, nº parcelas, data início, descrição)
- [x] **Editar** dívida existente (recria todas as parcelas)
- [x] **Excluir** dívida (cascade deleta parcelas)
- [x] **Geração automática de parcelas** com datas de vencimento baseadas no `dueDay` do cartão
- [x] **Toggle de parcela paga/não paga** (via Popover com Checkbox)
- [x] **Filtros**: por cartão, por pessoa/empresa, por mês/ano (via Calendar picker)
- [x] **Badge visual**: "Mês Atual" (destaque azul) e "Vencida" (destaque vermelho)
- [x] **Total de dívidas exibidas** (soma das parcelas filtradas)

### 3.5 UI/UX

- [x] Navbar responsiva com links para todas as seções
- [x] Tema escuro (dark mode fixo)
- [x] Toasts de sucesso/erro em todas as operações
- [x] Confirmação antes de excluir (`window.confirm`)
- [x] Estado de loading nos botões ("Salvando...")
- [x] Layout responsivo com grid adaptativo
- [x] Componentes shadcn/ui (Button, Card, Table, Select, Calendar, Badge, etc.)

---

## 4. O Que Falta Implementar / Melhorias 🔧

### 4.1 Prioridade Alta

| #   | Feature / Correção                                   | Descrição                                                                                                                                                                                                                                           |
| --- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Sincronização de usuário com DB**                  | Não existe webhook/lógica para criar registro `User` no banco quando o usuário se registra no Clerk. As Server Actions usam `userId` direto, mas o model User existe no schema sem ser populado. Implementar webhook do Clerk ou criação on-demand. |
| 2   | **Tratamento de erros nas Server Actions**           | O `redirect()` do Next.js dentro de try/catch lança uma exceção que é recapturada. Mover o `redirect()` para fora do try/catch.                                                                                                                     |
| 3   | **Página de login melhorada**                        | A página `/login` está com texto em inglês ("You are not logged in") e estilização básica. Falta tradução e design melhor.                                                                                                                          |
| 4   | **Arquivo `LoginForm.tsx` e `auth-mock.tsx` vazios** | Arquivos criados mas não implementados. Remover ou implementar.                                                                                                                                                                                     |
| 5   | **Página `/logado` placeholder**                     | Contém apenas "Estou logado". Remover ou substituir por funcionalidade real.                                                                                                                                                                        |
| 6   | **Navbar mobile (hamburger menu)**                   | A nav está `hidden md:flex` — em mobile não aparece nenhum menu.                                                                                                                                                                                    |

### 4.2 Prioridade Média

| #   | Feature / Melhoria                         | Descrição                                                                                                                          |
| --- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| 7   | **Dashboard/Home com resumo financeiro**   | A home page é só texto estático. Implementar cards com: total de dívidas, parcelas vencidas, total do mês atual, gráficos.         |
| 8   | **Validação de formulários (client-side)** | Usar `zod` + `react-hook-form` para validação robusta nos formulários. Hoje depende de `required` do HTML + validação no servidor. |
| 9   | **Feedback mais rico na exclusão**         | Substituir `window.confirm` por um Dialog/Modal do shadcn/ui (AlertDialog).                                                        |
| 10  | **Paginação na lista de dívidas**          | Com muitas dívidas, a página pode ficar pesada. Implementar paginação ou infinite scroll.                                          |
| 11  | **Busca/pesquisa por dívidas**             | Input de busca por descrição da dívida.                                                                                            |
| 12  | **Ordenação nas tabelas**                  | Permitir ordenar por nome, vencimento, valor etc.                                                                                  |
| 13  | **Formatação de moeda no input**           | Usar input com máscara de moeda (R$ 1.200,50) em vez de `type="number"`.                                                           |
| 14  | **Toggle de tema (dark/light)**            | `ThemeProvider` existe no projeto mas não está integrado no layout. O tema está fixo em `dark`.                                    |

### 4.3 Prioridade Baixa / Futuro

| #   | Feature                            | Descrição                                                                               |
| --- | ---------------------------------- | --------------------------------------------------------------------------------------- |
| 15  | **Relatórios e gráficos**          | Gráficos de gastos por mês, por cartão, por pessoa/empresa (usar recharts ou chart.js). |
| 16  | **Exportação de dados**            | Exportar dívidas/parcelas para CSV ou PDF.                                              |
| 17  | **Notificações de vencimento**     | Email ou push notification quando parcela está próxima do vencimento.                   |
| 18  | **Categorias de despesa**          | Adicionar campo de categoria (alimentação, lazer, saúde, etc.) nas dívidas.             |
| 19  | **Múltiplos métodos de pagamento** | Suporte a débito, Pix, boleto além de cartão de crédito.                                |
| 20  | **Testes automatizados**           | Unit tests (Vitest) e E2E (Playwright). Nenhum teste existe hoje.                       |
| 21  | **CI/CD e deploy**                 | Configurar GitHub Actions + deploy na Vercel.                                           |
| 22  | **Seed do banco**                  | Script `prisma/seed.ts` para popular dados de teste.                                    |
| 23  | **Loading states / Skeletons**     | Adicionar Suspense boundaries com skeleton UI nas páginas.                              |
| 24  | **PWA**                            | Transformar em Progressive Web App para uso mobile offline.                             |

---

## 5. Estrutura de Rotas

| Rota               | Tipo | Descrição                      |
| ------------------ | ---- | ------------------------------ |
| `/`                | Page | Home (dashboard)               |
| `/login`           | Page | Tela de login (Clerk)          |
| `/logado`          | Page | Placeholder (não utilizado)    |
| `/cards`           | Page | Listagem de cartões            |
| `/cards/new`       | Page | Formulário de novo cartão      |
| `/cards/[id]/edit` | Page | Formulário de edição de cartão |
| `/names`           | Page | Listagem de pessoas/empresas   |
| `/names/new`       | Page | Formulário de novo nome        |
| `/names/[id]/edit` | Page | Formulário de edição de nome   |
| `/debts`           | Page | Listagem de dívidas + filtros  |
| `/debts/new`       | Page | Formulário de nova dívida      |
| `/debts/[id]/edit` | Page | Formulário de edição de dívida |

---

## 6. Arquitetura de Componentes

```
layout.tsx (ClerkProvider, Toaster)
├── navbar.tsx (links, UserButton)
├── credit-card-form.tsx (criar/editar cartão)
├── person-company-form.tsx (criar/editar pessoa/empresa)
├── debt-form.tsx (criar/editar dívida)
├── debt-filters.tsx (filtros de cartão, pessoa, mês/ano)
├── delete-button.tsx (botão de exclusão reutilizável)
├── theme-provider.tsx (next-themes, não integrado)
└── ui/ (shadcn/ui components)
    ├── badge, button, calendar, card, checkbox
    ├── input, label, popover, select, sonner, table
```

---

## 7. Roadmap Sugerido (Próximos Passos)

### Sprint 1 — Correções Críticas

1. Implementar sincronização User Clerk → DB (webhook ou criação on-demand)
2. Corrigir `redirect()` dentro de try/catch nas Server Actions
3. Remover arquivos vazios/placeholder (`auth-mock.tsx`, `LoginForm.tsx`, `/logado`)
4. Traduzir página de login para português

### Sprint 2 — UX Essencial

5. Implementar menu mobile (hamburger/drawer)
6. Substituir `window.confirm` por AlertDialog do shadcn/ui
7. Integrar ThemeProvider para toggle dark/light
8. Adicionar validação com zod nos formulários

### Sprint 3 — Dashboard

9. Dashboard na home com cards de resumo (total dívidas, parcelas vencidas, gastos do mês)
10. Gráfico de gastos mensais por cartão

### Sprint 4 — Polish

11. Input de moeda com máscara
12. Paginação/busca na lista de dívidas
13. Loading skeletons
14. Testes automatizados

---

## 8. Como Rodar o Projeto

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Preencher: DATABASE_URL, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY

# Rodar migrations do Prisma
npx prisma migrate dev

# Gerar client do Prisma
npx prisma generate

# Rodar em dev
npm run dev
```

---

_Documento gerado em: 25/02/2026_
