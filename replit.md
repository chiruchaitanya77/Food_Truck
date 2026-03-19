# Shake Crazy Food Truck Website

## Overview

Full-stack food truck website for "Shake Crazy" with customer-facing landing page and admin dashboard.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/shake-crazy)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod, drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)
- **Animations**: GSAP, Framer Motion, canvas-confetti
- **Auth**: JWT (bcrypt + jsonwebtoken)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (port 8080, routes at /api)
│   └── shake-crazy/        # React+Vite frontend (port 21197, at /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
```

## Database Tables

- `menu_items` - 24+ pre-loaded menu items (Pizza, Burger, Sandwich, Rolls, Must Try, Shakes, Dessert)
- `festival_discounts` - Festival discount events with auto/manual activation
- `stopwatch_winners` - 10-second challenge winners
- `stopwatch_attempts` - Daily attempt tracking (1 per IP per day)
- `user_submissions` - Love sharing gallery submissions with approval flow
- `truck_location` - Current truck GPS location
- `analytics` - Visitor tracking
- `admin_users` - Admin user accounts

## Admin Credentials

- Email: admin@shakecrazy.com
- Password: ShakeCrazy2025!
- Admin panel: /admin

To change password: Use Supabase dashboard or run SQL update on admin_users table.

## API Routes

### Public
- GET /api/menu - Menu items
- GET /api/discounts - Active festival discounts
- GET /api/stopwatch/can-play - Check daily eligibility
- POST /api/stopwatch/attempt - Submit game attempt
- GET /api/stopwatch/winners - Recent winners
- GET /api/submissions - Approved love sharing posts
- POST /api/submissions - Submit a love sharing post
- GET /api/location - Current truck location
- POST /api/analytics/track - Track page visit

### Admin (requires JWT)
- POST /api/admin/login - Login
- GET /api/admin/stats - Dashboard stats
- CRUD /api/admin/menu - Menu management
- CRUD /api/admin/discounts - Discount management
- GET /api/admin/submissions + PUT approve - Submission moderation
- GET /api/admin/winners - All winners
- PUT /api/admin/location - Update truck location
- GET /api/admin/analytics - Analytics data

## Key Features

- Hero with GSAP animations and truck image
- Menu by category with veg/non-veg badges and prices
- 10-Second Challenge game (1 attempt/day per IP, confetti on win)
- Festival discount banners (auto/manual activation by date)
- Live truck location with Google Maps link
- Love Sharing Gallery (photo + text submissions, admin moderation)
- Recent Winners public showcase
- Admin dashboard (stats, menu CRUD, discount management, submission moderation, analytics)

## Environment Variables

- DATABASE_URL, PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
- JWT_SECRET (set in shared env)
- SMTP_HOST, SMTP_PORT, SMTP_USER, ADMIN_EMAIL (set for email)
