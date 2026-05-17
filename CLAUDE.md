# Evently — Georgian Events Platform

## What this project is
A full-stack social events platform for Georgia. Users discover event designers, book venues/bands/managers, buy tickets, and browse local events. Think Facebook meets Eventbrite meets a services marketplace, with a Georgian-first audience.

## Monorepo structure
```
new-project/
├── frontend/    ← Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Apollo Client
├── backend/     ← NestJS, GraphQL (code-first), Prisma ORM, PostgreSQL
└── CLAUDE.md
```

## Tech stack decisions (and why)

| Decision | Choice | Reason |
|----------|--------|--------|
| API style | GraphQL (Apollo) | Facebook-like feed + future mobile app share same API |
| Frontend | Next.js 15 App Router | Stable, SEO, Server Components |
| Backend | NestJS code-first GraphQL | Auto-generates schema, decorators, clean DX |
| ORM | Prisma + PostgreSQL | Type-safe, great DX |
| Auth | Custom JWT (NOT Clerk) | Owner controls access+refresh token flow with httpOnly cookies |
| Storage | Cloudinary | Image/file uploads |
| i18n | next-intl | Georgian (ka) + English (en) |
| UI | shadcn/ui + Tailwind | No inline styles, Tailwind only |

## Auth flow
- Access token: JWT, 15 min, sent in `Authorization: Bearer` header, stored in memory (NOT localStorage)
- Refresh token: JWT, 30 days, stored as bcrypt hash in DB, sent via httpOnly cookie named `refresh_token`
- Rotation: every refresh issues a new refresh token, old one invalidated
- OAuth: Google + Facebook via Passport.js — REST endpoints `/api/auth/google`, `/api/auth/facebook`
- Apollo error link intercepts 401 → calls refreshToken mutation → retries original operation

## Roles
- `CUSTOMER` — browse, like, save, book services, buy tickets
- `VENDOR` — everything above + upload designs, create services/events
  - Vendor types: `DESIGNER`, `VENUE`, `BAND`, `EVENT_MANAGER`
- `ADMIN` — full moderation access, ban users, set featured

## Database models (Prisma)
User, RefreshToken, Design, DesignLike, SavedDesign, Service, Booking, Event, Ticket, Notification, Message

Key schema notes:
- Event has `ticketPrice Float` and `totalTickets Int` (added in Chapter 9)
- User has `banned Boolean @default(false)` (added in Chapter 12)
- Message has `fromUser`/`toUser` relations named `SentMessages`/`ReceivedMessages`
- Role enum: CUSTOMER | VENDOR | ADMIN

## Backend structure
```
backend/src/
├── auth/           ← JWT, OAuth strategies, guards, decorators
├── users/          ← UsersService, UsersResolver, UserType
├── designs/        ← Design gallery, like/save, cursor pagination
├── services/       ← Services marketplace, booking system
├── events/         ← Events, tickets, QR codes, attendees
├── notifications/  ← In-app notifications, PubSub subscriptions
├── messaging/      ← User-to-user chat, conversations
├── admin/          ← Stats, moderation, featured management
├── upload/         ← POST /api/upload/avatar and /api/upload/images (Cloudinary)
└── prisma/         ← PrismaService (global module)
```

All REST routes prefixed with `/api` (set in main.ts via `setGlobalPrefix('api')`).
GraphQL endpoint: `/api/graphql`
OAuth REST: `/api/auth/google`, `/api/auth/facebook`, `/api/auth/refresh`, `/api/auth/logout`
Upload REST: `/api/upload/avatar`, `/api/upload/images`

## Frontend structure
```
frontend/src/
├── app/[locale]/
│   ├── (auth)/login, register
│   └── (protected)/
│       ├── dashboard, profile, onboarding
│       ├── feed/           ← design news feed
│       ├── designs/        ← design detail, my designs
│       ├── services/       ← marketplace, my services
│       ├── bookings/       ← customer + vendor bookings
│       ├── events/         ← events, my events, attendees
│       ├── tickets/        ← customer tickets with QR
│       ├── discover/       ← local city-based discovery
│       ├── messages/       ← two-panel chat
│       └── admin/          ← admin dashboard (ADMIN role only)
├── components/
│   ├── auth/, profile/, designs/, services/
│   ├── events/, discovery/, messaging/
│   ├── notifications/, admin/
│   └── layout/             ← nav.tsx, language-switcher.tsx
├── graphql/                ← all GQL documents + types per feature
├── lib/
│   ├── apollo/             ← client.ts (auth+error links), provider.tsx
│   └── auth/               ← auth-context.tsx, token.ts (in-memory)
└── i18n/                   ← next-intl routing, request config
```

## i18n
- Locales: `en` (English), `ka` (Georgian)
- Files: `frontend/messages/en.json`, `frontend/messages/ka.json`
- Namespaces: auth, roles, profile, feed, services, events, discover, notifications, messages, admin, common
- Language switcher in nav — toggles between /en/... and /ka/... routes

## Key patterns to follow when making changes

1. **GraphQL types**: define ObjectType in `backend/src/[module]/[name].type.ts`, InputType in `backend/src/[module]/dto/`
2. **Guards**: always use `@UseGuards(GqlAuthGuard)` for protected queries/mutations; add `@UseGuards(GqlAuthGuard, RolesGuard) @Roles('VENDOR')` for vendor-only
3. **Current user**: use `@CurrentUser()` decorator in resolvers — reads from JWT payload
4. **Frontend GQL**: write documents in `frontend/src/graphql/[feature]/`, types in `types.ts`, queries in `queries.ts`, mutations in `mutations.ts`
5. **Components**: Tailwind only, no inline styles. `'use client'` only where hooks/state needed
6. **Images**: use Next.js `<Image>` from `next/image`, not `<img>`
7. **Uploads**: POST to `/api/upload/avatar` (single) or `/api/upload/images` (multiple, max 10) — returns `{ url }` or `{ urls[] }`
8. **Notifications**: inject `NotificationsService` in any backend service to create in-app notifications
9. **Prisma changes**: add fields to schema.prisma, run `cd backend && npx prisma generate` (do NOT run migrate in this environment — no live DB)
10. **TypeScript**: always run `tsc --noEmit` in both frontend and backend after changes, fix all errors before committing

## Environment variables needed

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PORT=3001
NODE_ENV=development
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

## How to run locally
```bash
# Backend
cd backend && cp .env.example .env
# fill .env
npx prisma migrate dev
npm run start:dev   # http://localhost:3001/api/graphql

# Frontend
cd frontend && cp .env.local.example .env.local
# fill .env.local
npm run dev         # http://localhost:3000
```

## Chapters completed
1. Monorepo foundation — Next.js 15, NestJS, configs
2. Database schema — all Prisma models
3. Auth backend — JWT, Google, Facebook OAuth, refresh token rotation
4. Auth frontend — Apollo, login/register pages, protected routes
5. Role system — customer/vendor guards, vendor onboarding
6. User profiles — avatar upload, public vendor profiles
7. Design gallery — news feed, infinite scroll, like/save
8. Services marketplace — venues, bands, managers, booking requests
9. Events & tickets — QR codes, attendee management
10. Local discovery — Georgian cities, featured/upcoming events, nav bar
11. Notifications & messaging — real-time bell, in-app chat
12. Admin dashboard — stats, ban users, featured management
13. i18n — Georgian + English complete, language switcher
14. Polish & launch — SEO metadata, error boundaries, Next.js Image, README

## Branch
`claude/project-planning-structure-Qnyhd`
