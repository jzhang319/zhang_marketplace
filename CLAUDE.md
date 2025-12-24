# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A digital marketplace for buying and selling UI components, templates, and icons. Built with Next.js 14 (App Router), TypeScript, and a PostgreSQL database.

## Development Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma db push   # Push schema changes to database
npx prisma studio    # Open Prisma database GUI
```

## Architecture

### Tech Stack
- **Framework**: Next.js 14.2 with App Router (Server Components by default)
- **Database**: PostgreSQL (Supabase) with Prisma ORM
- **Auth**: Kinde Auth (OAuth) - user ID from Kinde is used as primary key
- **Payments**: Stripe + Stripe Connect for vendor payouts (10% platform fee)
- **File Uploads**: UploadThing (images up to 4MB, zip files for products)
- **Email**: Resend with React Email templates
- **UI**: Tailwind CSS + shadcn/ui (Radix primitives)

### Key Patterns

**Server Actions over API Routes**: Form submissions use server actions in `app/action.ts`:
- `SellProduct` - Creates product listing with Zod validation
- `UpdateUserSettings` - Updates user profile
- `BuyProduct` - Creates Stripe checkout session with Connect transfer
- `CreateStripeAccountLink` / `GetStripeStripeDashboardLink` - Stripe Connect onboarding

**Authentication Flow**:
1. User logs in via Kinde → redirects to `/api/auth/creation`
2. First login creates: Stripe Connect Express account + User record in DB
3. Session accessed via `getKindeServerSession()` from `@kinde-oss/kinde-auth-nextjs/server`

**Prisma Singleton**: `app/lib/db.ts` prevents multiple Prisma instances in dev mode.

### Data Model

```
User
├── id (from Kinde)
├── email, firstName, lastName, profileImage
├── connectedAccountId (Stripe Connect)
├── stripeConnectedLinked (boolean)
└── Product[] (has many)

Product
├── id (UUID)
├── name, price (cents), smallDescription
├── description (JSON - TipTap editor content)
├── images[] (UploadThing URLs)
├── productFile (zip URL)
├── category (enum: template | uikit | icon)
└── userId (belongs to User)
```

### Directory Structure

```
app/
├── api/
│   ├── auth/[kindeAuth]/     # Kinde OAuth routes
│   ├── auth/creation/        # User creation on first login
│   ├── stripe/               # Webhooks (checkout.session.completed sends email)
│   └── uploadthing/          # File upload endpoints
├── components/               # App-specific components (Navbar, ProductCard, forms)
├── lib/                      # Utilities (db.ts, stripe.ts, categoryItems)
├── product/[id]/             # Product detail page
├── products/[category]/      # Category browse page
├── sell/                     # Create product listing
├── billing/                  # Stripe Connect setup
├── my-products/              # Seller dashboard
├── settings/                 # User profile settings
├── payment/{success,cancel}/ # Post-checkout pages
├── action.ts                 # Server actions
└── globals.css               # Global styles + Tailwind

components/ui/                # shadcn/ui components
prisma/schema.prisma          # Database schema
```

### External Services Configuration

All services require environment variables:
- **Kinde**: KINDE_CLIENT_ID, KINDE_CLIENT_SECRET, KINDE_ISSUER_URL, etc.
- **Database**: DATABASE_URL (pooled), DIRECT_URL (direct connection)
- **Stripe**: STRIPE_SECRET_KEY, STRIPE_CONNECT_WEBHOOK_SECRET
- **UploadThing**: UPLOADTHING_SECRET, UPLOADTHING_APP_ID
- **Resend**: RESEND_API_KEY
- **Deployment**: DEPLOYMENT_BASE_URL (used for Stripe redirect URLs)

### Stripe Integration

- **Checkout**: Creates session with `payment_intent_data.transfer_data` for Connect
- **Platform Fee**: 10% application fee on all transactions
- **Webhook** (`/api/stripe`): On `checkout.session.completed`, sends product download email via Resend

### Rich Text

Product descriptions use TipTap editor, stored as JSON in the database. Rendered via `ProductDescription` component.
