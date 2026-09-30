# SideShift - Side-Hustle Optimizer

SideShift helps users discover the highest-paying side hustles that match their skills, location, and available hours.

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API routes + Supabase (Auth, Database, Storage)
- **AI**: OpenAI API (gpt-4o-mini)
- **Payments**: Stripe

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in the root directory and add the following:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 2. Database Setup
Run the provided SQL schema in the Supabase SQL Editor:
`supabase/schema.sql`

### 3. Running the App
```bash
npm install
npm run dev
```

## Features
- Multi-step onboarding flow
- AI-powered opportunity ranking
- Earnings tracker with analytics
- Premium subscription model via Stripe
