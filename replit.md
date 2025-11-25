# GD Demonlist - Geometry Dash Ranking System

## Overview

GD Demonlist is a community-driven ranking platform for Geometry Dash demon levels. The application allows players to view ranked demons, submit completion records, and compete on a global leaderboard. Administrators can manage demon rankings and verify player submissions. The system features a high-energy public interface inspired by Discord's gaming aesthetic combined with Linear's clean admin efficiency, all infused with Geometry Dash's signature neon geometric style.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**Routing**: wouter for lightweight client-side routing with the following public routes:
- `/` - Landing page (unauthenticated) or Home redirect (authenticated)
- `/demonlist` - Main demon ranking list with filtering
- `/leaderboard` - Player rankings and points
- `/submit` - Record submission form
- `/admin/*` - Protected admin panel routes (dashboard, demons, submissions)

**State Management**: TanStack Query (React Query) for server state synchronization with infinite stale time and disabled refetching by default

**UI Component Library**: shadcn/ui (Radix UI primitives) with custom Tailwind configuration
- Custom color system with CSS variables for theming
- "New York" style variant
- Custom border radius scale (9px/6px/3px)
- Dark mode support via class-based theme switching

**Typography System**:
- Primary: Inter (Google Fonts) - Body text and UI elements
- Accent: Space Grotesk (Google Fonts) - Headers and CTAs
- Hierarchical scale from xs to 5xl with semantic weight assignments

**Design Tokens**: Extensive Tailwind customization with HSL-based color system supporting light/dark modes, custom shadow scales, and elevation utilities (`hover-elevate`, `active-elevate-2`)

### Backend Architecture

**Runtime**: Node.js with Express.js server

**Development/Production Split**:
- Development: Vite dev server with HMR middleware integration
- Production: Static file serving from built assets

**Session Management**: 
- express-session with PostgreSQL session store (connect-pg-simple)
- 7-day session TTL with secure, httpOnly cookies
- Session table required in database schema

**API Structure**: RESTful endpoints organized by domain:
- `/api/auth/*` - Authentication endpoints (Replit OAuth)
- `/api/demons` - Public demon listing
- `/api/leaderboard` - Public player rankings
- `/api/records` - User record submissions
- `/api/admin/*` - Protected admin operations (requires isAdmin middleware)

**Middleware Stack**:
- JSON body parsing with raw body preservation for webhooks
- Request logging with timing and JSON response capture
- Authentication middleware (isAuthenticated, isAdmin)

### Data Storage

**Database**: PostgreSQL (via Neon serverless driver with WebSocket support)

**ORM**: Drizzle ORM with schema-first approach

**Schema Structure**:

1. **sessions** - OAuth session storage (required for Replit Auth)
   - sid (primary key), sess (jsonb), expire (timestamp with index)

2. **users** - Player accounts
   - id, email, firstName, lastName, profileImageUrl, isAdmin flag
   - Timestamps: createdAt, updatedAt

3. **demons** - Ranked demon levels
   - id, name, creator, position (ranking), difficulty, points, videoUrl, completionCount
   - Timestamps: createdAt, updatedAt

4. **records** - Player completion submissions
   - id, userId, demonId, videoUrl, status (pending/approved/rejected)
   - reviewerId, reviewedAt for verification tracking
   - Timestamps: createdAt, updatedAt

**Data Access Pattern**: Repository pattern via DatabaseStorage class implementing IStorage interface, abstracting database operations with semantic methods (getUser, createDemon, approveRecord, etc.)

**Schema Validation**: Zod schemas generated from Drizzle schema via drizzle-zod for runtime validation

### Authentication & Authorization

**Provider**: Replit OAuth via OpenID Connect (OIDC)

**Strategy**: Passport.js with openid-client strategy

**Flow**:
1. Unauthenticated users redirected to `/api/login`
2. OAuth callback creates/updates user in database
3. Session established with user claims, access token, refresh token
4. User object serialized to session

**Authorization Levels**:
- Public: Demon list, leaderboard viewing
- Authenticated: Record submission, profile access
- Admin: Demon management (CRUD), record verification, user administration

**Token Refresh**: Automatic token refresh on expiry using refresh tokens stored in session

### External Dependencies

**Authentication Service**: Replit OAuth (replit.com/oidc) - Required for user authentication

**Database Provider**: Neon Serverless PostgreSQL - Configured via DATABASE_URL environment variable with WebSocket connections

**Asset Storage**: Local filesystem via `/attached_assets` - Hero images and static assets

**Email Service**: None currently implemented

**Third-party APIs**: None currently implemented

**Build Tools**:
- Vite - Frontend bundling and dev server
- esbuild - Backend production bundling
- Drizzle Kit - Database migrations and schema management

**Required Environment Variables**:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `REPL_ID` - Replit application identifier for OAuth
- `ISSUER_URL` - OAuth issuer endpoint (defaults to replit.com/oidc)
- `NODE_ENV` - Environment flag (development/production)

**Development Dependencies**: 
- Replit-specific Vite plugins for runtime error overlay, cartographer, and dev banner (conditional on REPL_ID)