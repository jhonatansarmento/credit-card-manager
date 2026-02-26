# Controle de Dívidas - Documentação do Projeto

## 1. Visão Geral

Aplicação web para **gerenciamento de dívidas em cartões de crédito**, permitindo ao usuário cadastrar cartões, pessoas/empresas associadas e registrar dívidas parceladas com controle individual de cada parcela.

### Stack Tecnológica

| Camada         | Tecnologia                                      |
| -------------- | ----------------------------------------------- |
| Framework      | **Next.js 15.4** (App Router, RSC)              |
| Linguagem      | TypeScript 5                                    |
| Autenticação   | **better-auth** (email/senha + Google OAuth)    |
| Banco de Dados | **PostgreSQL** (Neon Serverless) + Prisma ORM 6 |
| UI             | **Tailwind CSS 4** + shadcn/ui + Radix          |
| Formulários    | React Hook Form + Zod (login/signup)            |
| Notificações   | Sonner (toast)                                  |
| Ícones         | Lucide React + simple-icons (marcas de cartão)  |

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

| Entidade          | Campos principais                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **User**          | id, email, name, emailVerified, image                                                                                    |
| **CreditCard**    | name, dueDay (1-31). Unique por (userId, name)                                                                           |
| **PersonCompany** | name. Unique por (userId, name)                                                                                          |
| **Debt**          | cardId, personCompanyId, totalAmount (Decimal), installmentsQuantity, installmentValue (Decimal), startDate, description |
| **Installment**   | debtId, installmentNumber, dueDate, amount (Decimal), isPaid                                                             |

> Campos monetários usam `Decimal(10,2)` para precisão financeira.

---

## 3. Features Implementadas ✅

### 3.1 Autenticação

- [x] Login/Logout via **better-auth** (email/senha + Google OAuth)
- [x] Cadastro com validação Zod (nome, email, senha, confirmação)
- [x] Middleware de proteção de rotas
- [x] Verificação de sessão em todas as API routes e páginas protegidas

### 3.2 Cartões de Crédito (`/cards`)

- [x] CRUD completo (listar, criar, editar, excluir)
- [x] Badge visual com ícone da bandeira/banco (Nubank, Inter, Itaú, etc.)
- [x] Validação de nome único por usuário
- [x] Proteção contra exclusão com dívidas vinculadas

### 3.3 Pessoas/Empresas (`/names`)

- [x] CRUD completo (listar, criar, editar, excluir)
- [x] Validação de nome único por usuário
- [x] Proteção contra exclusão com dívidas vinculadas

### 3.4 Dívidas (`/debts`)

- [x] CRUD completo com geração automática de parcelas
- [x] Datas de vencimento baseadas no `dueDay` do cartão (aritmética UTC)
- [x] Toggle de parcela paga/não paga
- [x] Edição preserva status de pagamento (`isPaid`) das parcelas existentes
- [x] Filtros independentes: cartão, pessoa/empresa, mês, ano (qualquer combinação)
- [x] Botão "Mês Atual" para filtro rápido
- [x] Filtros aplicam automaticamente ao selecionar
- [x] Badge visual: "Mês Atual" (azul) e "Vencida" (vermelho)
- [x] Total das parcelas filtradas exibido

### 3.5 UI/UX

- [x] Navbar responsiva com menu hamburger mobile
- [x] Dark mode
- [x] Toasts de sucesso/erro (Sonner)
- [x] Confirmação via AlertDialog antes de excluir
- [x] Loading states nos botões de submit
- [x] Layout responsivo com grid adaptativo

### 3.6 Arquitetura

- [x] API Routes (REST) com service layer
- [x] Prisma com Neon Serverless adapter (HTTP)
- [x] Husky + lint-staged + Prettier (pre-commit hooks)

---

## 4. Estrutura de Rotas

| Rota               | Tipo | Descrição                      |
| ------------------ | ---- | ------------------------------ |
| `/`                | Page | Home com links de navegação    |
| `/login`           | Page | Login (email/senha + Google)   |
| `/signup`          | Page | Cadastro                       |
| `/cards`           | Page | Listagem de cartões            |
| `/cards/new`       | Page | Formulário de novo cartão      |
| `/cards/[id]/edit` | Page | Formulário de edição de cartão |
| `/names`           | Page | Listagem de pessoas/empresas   |
| `/names/new`       | Page | Formulário de novo nome        |
| `/names/[id]/edit` | Page | Formulário de edição de nome   |
| `/debts`           | Page | Listagem de dívidas + filtros  |
| `/debts/new`       | Page | Formulário de nova dívida      |
| `/debts/[id]/edit` | Page | Formulário de edição de dívida |

### API Routes

| Endpoint                       | Métodos     | Descrição                |
| ------------------------------ | ----------- | ------------------------ |
| `/api/auth/[...all]`           | ALL         | better-auth handler      |
| `/api/cards`                   | GET, POST   | Listar/criar cartões     |
| `/api/cards/[id]`              | PUT, DELETE | Editar/excluir cartão    |
| `/api/names`                   | GET, POST   | Listar/criar nomes       |
| `/api/names/[id]`              | PUT, DELETE | Editar/excluir nome      |
| `/api/debts`                   | GET, POST   | Listar/criar dívidas     |
| `/api/debts/[id]`              | PUT, DELETE | Editar/excluir dívida    |
| `/api/debts/installments/[id]` | PATCH       | Toggle isPaid da parcela |

---

## 5. Arquitetura de Componentes

```
layout.tsx (Toaster)
├── navbar.tsx (links, sign-out button)
├── mobile-menu.tsx (hamburger menu)
├── sign-out-button.tsx (com AlertDialog de confirmação)
├── card-brand-badge.tsx (ícone da bandeira/banco)
├── credit-card-form.tsx (criar/editar cartão)
├── person-company-form.tsx (criar/editar pessoa/empresa)
├── debt-form.tsx (criar/editar dívida)
├── debt-filters.tsx (filtros com selects independentes)
├── delete-button.tsx (exclusão com AlertDialog)
├── toggle-installment-button.tsx (marcar parcela como paga)
├── theme-provider.tsx (next-themes)
└── ui/ (shadcn/ui components)
```

---

## 6. Como Rodar o Projeto

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Preencher: DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL

# Rodar migrations do Prisma
npx prisma migrate dev

# Gerar client do Prisma
npx prisma generate

# Rodar em dev
npm run dev
```

---

_Documento atualizado em: 26/02/2026_
