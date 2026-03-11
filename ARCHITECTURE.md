# StewardOS Multi-Church Architecture

Every church is a completely isolated tenant. Church A can never see Church B's data — guaranteed at multiple layers.

## The Four Layers

| Layer | Technology | Implementation |
|-------|------------|----------------|
| **1. Auth** | Clerk Organizations | Each church = 1 Clerk Org. Users belong to one org. Roles (admin/staff/volunteer) per org. |
| **2. API** | `church_id` on every request | `requireChurch()` reads `orgId` from Clerk session. No org = no data. Never trust client. |
| **3. Database** | Supabase RLS | Run RLS migrations in Supabase SQL Editor. Add `SUPABASE_SERVICE_ROLE_KEY` for `createSupabaseForRequest()`. |
| **4. Billing** | Stripe per-church | `lib/stripe.ts` — each church has Customer + Subscription. Set `STRIPE_PRICE_ID` in env. |

## Data Hierarchy

```
StewardOS Platform
└── Church (Clerk Org + Church row)
    ├── Campuses
    ├── ChurchUsers (role: admin | staff | volunteer)
    └── Guests, Tasks, Events
```

## Key Files

- **`lib/auth.ts`** — `requireChurch()`, `getChurchOptional()`, `isAdminOrPastor()`
- **`lib/church.ts`** — `getChurchByClerkOrg()`, `syncChurch()` (Clerk org → Church row)
- **`lib/db.ts`** — Prisma client, `setChurchContext()` for RLS
- **`lib/supabase.ts`** — `createSupabaseForRequest()` — Supabase client with `app.church_id` set for RLS
- **`lib/stripe.ts`** — `getOrCreateChurchCustomer()`, `createCheckoutSession()`, `createPortalSession()`

## API Pattern

```ts
// Every church-scoped API route:
export async function GET() {
  const ctx = await requireChurch(); // throws 401/403 if no auth/org
  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) return NextResponse.json([]);
  // ... query with church.id, never ctx from client
}
```

## Setup Checklist

1. **Database**: Set `DATABASE_URL` and `DIRECT_URL` in `.env.local` (Supabase Dashboard → Settings → Database)
2. **Migrations**: `npx prisma migrate deploy`
3. **RLS**: Run `supabase/migrations/00002_rls_churches_campuses_users_invites.sql`, `00003_rls_data_tables.sql`, and `00004_set_app_church_id_rpc.sql` in Supabase SQL Editor
4. **Supabase**: Add `SUPABASE_SERVICE_ROLE_KEY` (Settings → API → service_role) for `createSupabaseForRequest()`
4. **Stripe**: Create a Price in Stripe Dashboard, add `STRIPE_PRICE_ID` to env
5. **Church sync**: Call `POST /api/churches/sync` when user first accesses dashboard (or add to DashboardHeader mount)
