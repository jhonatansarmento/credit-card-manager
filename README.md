# Credit Card Manager

A full-stack web application for managing credit card debts, tracking installments, and organizing payments across multiple cards and people/companies.

![Next.js](https://img.shields.io/badge/Next.js-15.4-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)

## Features

### Credit Cards

- Create, edit, and delete credit cards with custom due days (1–31)
- Automatic brand detection with icons (Nubank, Inter, Itaú, Bradesco, Santander, C6, and more)
- Unique card names per user

### People / Companies

- Register people or companies associated with debts
- Full CRUD with uniqueness validation per user

### Debts & Installments

- Register debts with total amount, number of installments, start date, and description
- Automatic installment generation with due dates based on the card's due day
- Toggle individual installments as paid/unpaid
- Visual badges: **Current Month** (blue) and **Overdue** (red)
- Total amount displayed updates based on active filters

### Filters

- Filter debts by credit card, person/company, month, year, or any combination
- Independent month and year selects — filter by year only, month only, or both
- **Current Month** quick filter button
- Filters apply immediately on selection

### Authentication

- Email/password and Google OAuth via [better-auth](https://www.better-auth.com/)
- Protected routes with middleware
- Automatic redirect for unauthenticated users

### UI/UX

- Dark mode
- Fully responsive layout with mobile hamburger menu
- Confirmation dialogs (AlertDialog) before destructive actions
- Toast notifications for all operations
- Loading states on form submissions

## Tech Stack

| Layer          | Technology                              |
| -------------- | --------------------------------------- |
| Framework      | Next.js 15.4 (App Router, RSC)          |
| Language       | TypeScript 5                            |
| Authentication | better-auth 1.4                         |
| Database       | PostgreSQL (Neon Serverless) + Prisma 6 |
| UI             | Tailwind CSS 4 + shadcn/ui + Radix      |
| Forms          | React Hook Form + Zod                   |
| Notifications  | Sonner                                  |
| Icons          | Lucide React + simple-icons             |
| Linting        | ESLint + Prettier + Husky + lint-staged |

## Data Model

```
User (1) ──→ (N) CreditCard
User (1) ──→ (N) PersonCompany
User (1) ──→ (N) Debt
CreditCard (1) ──→ (N) Debt
PersonCompany (1) ──→ (N) Debt
Debt (1) ──→ (N) Installment
```

| Entity            | Key Fields                                                                         |
| ----------------- | ---------------------------------------------------------------------------------- |
| **User**          | id, email, name, emailVerified                                                     |
| **CreditCard**    | name, dueDay (1–31), unique per user                                               |
| **PersonCompany** | name, unique per user                                                              |
| **Debt**          | cardId, personCompanyId, totalAmount, installmentsQuantity, startDate, description |
| **Installment**   | debtId, installmentNumber, dueDate, amount, isPaid                                 |

## Project Structure

```
src/
├── app/
│   ├── api/              # REST API routes (cards, debts, names, auth)
│   ├── cards/            # Credit card pages (list, new, edit)
│   ├── debts/            # Debt pages (list, new, edit)
│   ├── names/            # Person/company pages (list, new, edit)
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home / dashboard
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── navbar.tsx        # Navigation bar
│   ├── mobile-menu.tsx   # Mobile hamburger menu
│   ├── credit-card-form.tsx
│   ├── debt-form.tsx
│   ├── debt-filters.tsx
│   ├── person-company-form.tsx
│   ├── delete-button.tsx
│   └── ...
├── lib/
│   ├── auth.ts           # better-auth server config
│   ├── auth-client.ts    # better-auth client
│   ├── auth-session.ts   # Session helper
│   ├── db.ts             # Prisma client (Neon adapter)
│   ├── card-brand.ts     # Card brand detection & icons
│   └── utils.ts
├── services/             # Business logic layer
│   ├── credit-card.service.ts
│   ├── debt.service.ts
│   └── name.service.ts
└── middleware.ts          # Route protection
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or a [Neon](https://neon.tech/) account)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd credit-card-manager

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
```

For Google OAuth (optional):

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Database Setup

```bash
# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

## Deployment

The app is configured for deployment on [Vercel](https://vercel.com/) with a Neon PostgreSQL database.

```bash
# The build command runs prisma generate before next build
npm run build
```

## License

Private project.
