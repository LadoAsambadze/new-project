# Evently — Georgian Events Platform

A full-stack events platform built with Next.js 15 and NestJS.

## Stack
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Apollo Client
- **Backend**: NestJS, GraphQL (code-first), Prisma ORM, PostgreSQL
- **Auth**: JWT access/refresh tokens, Google OAuth, Facebook OAuth
- **Storage**: Cloudinary
- **i18n**: Georgian (ka) + English (en)

## Structure
```
frontend/   — Next.js 15 app
backend/    — NestJS GraphQL API
```

## Getting Started

### Backend
```bash
cd backend
cp .env.example .env
# fill in .env values
npm install
npx prisma migrate dev
npm run start:dev
```

### Frontend
```bash
cd frontend
cp .env.local.example .env.local
# fill in .env.local values
npm install
npm run dev
```

## Features
- Design gallery with news feed, likes, saves
- Services marketplace (designers, venues, bands, event managers)
- Event creation with ticket sales and QR codes
- Local discovery by Georgian city
- Real-time notifications and messaging
- Admin dashboard with moderation tools
- Georgian + English UI
