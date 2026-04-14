@AGENTS.md

# HomeschoolDealsFinder.com

A deal aggregation and community platform for homeschool families. Users discover curriculum discounts, STEM kit sales, subscription box deals, and more — all curated and verified.

## Stack

- **Framework**: Next.js 15 (App Router, Server Components)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Database**: Supabase Postgres via Prisma ORM
- **Auth**: Supabase Auth (@supabase/ssr)
- **Email**: Resend
- **Hosting**: Vercel

## Key Conventions

- **File structure**: App Router (`src/app/`), components in `src/components/`, lib utilities in `src/lib/`
- **Naming**: kebab-case for files/folders, PascalCase for components, camelCase for functions/variables
- **Components**: Server Components by default; add `"use client"` only when needed (interactivity, hooks)
- **Data fetching**: Server Components fetch data directly via Prisma; client components use React Query
- **Validation**: Zod schemas for all API inputs
- **API responses**: Consistent `{ data, error, meta }` shape

## Common Commands

```bash
npm run dev        # Start dev server (Turbopack)
npm run build      # Production build
npm run lint       # ESLint
npx prisma db push # Push schema to database
npx prisma studio  # Open database GUI
npx prisma generate # Regenerate Prisma client
```
