# HomeschoolDealsFinder.com

A deal aggregation and community platform for homeschool families. Discover curriculum discounts, STEM kit sales, subscription box deals, and more — all curated and verified.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: PostgreSQL via Supabase + Prisma ORM
- **Auth**: Supabase Auth
- **Email**: Resend
- **Hosting**: Vercel

## Local Development

### Prerequisites

- Node.js 18+
- npm
- A Supabase project (free tier works)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/homeschooldeals.git
   cd homeschooldeals
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in your Supabase URL, anon key, service role key, and database URL.

4. Set up the database:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. Start the dev server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `DATABASE_URL` | PostgreSQL connection string |
| `RESEND_API_KEY` | Resend API key for transactional emails |
| `NEXT_PUBLIC_SITE_URL` | Public site URL |

## Database

```bash
npx prisma db push      # Push schema changes
npx prisma db seed       # Seed initial data
npx prisma studio        # Open database GUI
npx prisma generate      # Regenerate client
```

## Importing Deals

To import deals from the Cowork-generated CSV:

```bash
npm run import-deals
```

## Deployment

The project deploys to Vercel automatically on push to `main` via GitHub Actions. Ensure the following secrets are set in your GitHub repo:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

And all environment variables are configured in the Vercel dashboard.
