# PRD — NexusHub: White-Label Community & Membership Platform

**Version:** 1.0.0  
**Date:** June 10, 2026  
**Status:** Ready for Implementation  
**Author:** Ali (Rawalpindi, PK)  
**Build Method:** Claude Code + Sub-Agents + Microservices on Supabase  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Market Opportunity](#3-market-opportunity)
4. [Goals & Non-Goals](#4-goals--non-goals)
5. [User Personas & Stories](#5-user-personas--user-stories)
6. [Feature Requirements](#6-feature-requirements)
7. [System Architecture](#7-system-architecture)
8. [Database Schema](#8-database-schema-supabase--postgresql)
9. [Microservices Design](#9-microservices-design)
10. [Frontend Architecture](#10-frontend-architecture-nextjs-15)
11. [Supabase Integration Strategy](#11-supabase-integration-strategy)
12. [CI/CD Pipeline](#12-cicd-pipeline)
13. [Claude Code Sub-Agent Execution Plan](#13-claude-code-sub-agent-execution-plan)
14. [Security & RLS Policies](#14-security--rls-policies)
15. [Success Metrics](#15-success-metrics)
16. [Open Questions](#16-open-questions)
17. [Phased Timeline](#17-phased-timeline)

---

## 1. Executive Summary

**NexusHub** is a self-hosted, white-label community and membership platform — a developer-owned alternative to Circle ($199/mo) and Skool ($99/mo) that runs on your own infrastructure with **zero platform fees** and **no vendor lock-in**.

Community owners pay for their own hosting (~$20–50/mo total), keep 100% of membership revenue minus payment processor fees, and own their data completely. NexusHub is built on Supabase (PostgreSQL + Realtime + RLS + Storage + Auth) with a NestJS microservices backend and Next.js 15 frontend.

**Selected because:** Skool/Circle created a validated, high-LTV market. Circle recently hit $200M valuation. The gap is a **self-hosted, open-source-friendly, developer-controlled** version with comparable features. No LLM API costs — pure infra + product.

---

## 2. Problem Statement

Creators, coaches, and educators building online communities face two bad choices in 2026:

1. **Skool ($99/mo):** Simple but zero white-label, no custom domain, vendor lock-in, weak analytics, and Skool's branding is always visible.
2. **Circle ($89–$219/mo):** More features but expensive tiers, per-member pricing at scale, and still no true data ownership.

Both platforms take platform risk — if they pivot pricing or shut down, your community is gone. Both lack self-hosting options. Both have weak APIs for builders who want custom integrations.

**The cost of not solving this:** A community with 500 paying members at $29/mo ($14,500 MRR) pays Circle ~$199–219/mo AND hands over data ownership. A self-hosted alternative at $30/mo hosting keeps 100% of that $14,500 while owning the relationship.

---

## 3. Market Opportunity

- Circle recently achieved a **$200M valuation** — market validation at the highest level.
- Skool's flat-rate Pro plan ($99/mo, unlimited members, 0% transaction fees) set a pricing anchor developers can undercut with self-hosting.
- ~60% of community builders are **educators** (courses, coaching, workshops) — a segment that wants tight control over content access.
- Segment most underserved: **technical founders and indie SaaS builders** who want a community layer embedded in their own product, not bolted on from a third party.
- Pakistan/MENA angle: local communities (bootcamps, professional networks, creator groups) cannot afford $99–$219/mo USD pricing. A free/self-hosted version serves this market with local payment gateways.

---

## 4. Goals & Non-Goals

### Goals

| # | Goal | Measurement |
|---|------|-------------|
| G1 | Community owners can launch a fully functional community in under 30 minutes | Time-to-first-post < 30min |
| G2 | Members experience sub-200ms feed loads for communities up to 10,000 members | p95 API latency < 200ms |
| G3 | Zero platform fees — owner keeps 100% minus payment processor cut | Revenue capture = 100% - Stripe fees |
| G4 | Full white-label — no NexusHub branding visible to members | Brand audit: 0 NexusHub mentions to members |
| G5 | Community owners can self-host on a $20/mo VPS with no DevOps expertise | Documented 1-command Docker deploy |

### Non-Goals (V1)

| # | Non-Goal | Rationale |
|---|----------|-----------|
| NG1 | Native mobile apps (iOS/Android) | PWA covers mobile V1; native is Phase 3 |
| NG2 | Built-in video hosting | Use Mux/Cloudflare Stream embed; storage adds infra cost |
| NG3 | LLM/AI features | Explicitly excluded per project constraint; no API costs |
| NG4 | Multi-community federation | One platform = one community cluster in V1 |
| NG5 | Marketplace for communities | Single-tenant deployment focus in V1 |

---

## 5. User Personas & User Stories

### Persona A — Community Owner (Creator/Coach)

**As a community owner,** I want to create a Space (like a channel/group) so that I can organize content by topic or membership tier.

**As a community owner,** I want to create paid membership tiers (e.g., Free, Pro, VIP) so that I can gate content and monetize my audience.

**As a community owner,** I want to send email broadcasts to all members or a segment so that I can nurture the community without a separate email tool.

**As a community owner,** I want to see a dashboard with MRR, active members, churn rate, and top posts so that I can make data-driven decisions.

**As a community owner,** I want my community to live at `community.mysite.com` (custom domain) so that members never see a third-party platform.

### Persona B — Community Member

**As a member,** I want to see a real-time feed of new posts across all Spaces I have access to so that I stay up-to-date without refreshing.

**As a member,** I want to reply to posts with rich text, code blocks, images, and reactions so that discussions feel like modern social media.

**As a member,** I want to message other members directly (DMs) so that I can network within the community.

**As a member,** I want to complete courses/modules within a Space so that I can track my learning progress.

**As a member,** I want to receive push/email notifications for replies and mentions so that I never miss important conversations.

### Persona C — Developer/Builder

**As a developer,** I want a fully documented REST API with Swagger so that I can build custom integrations.

**As a developer,** I want a one-command Docker Compose setup so that I can run the full stack locally in under 5 minutes.

**As a developer,** I want webhooks for key events (new member, payment, new post) so that I can integrate with external tools.

---

## 6. Feature Requirements

### P0 — Must Have (V1 ships without these = not viable)

#### Auth & Membership
- [ ] Email/password + social OAuth (Google, GitHub) via Supabase Auth
- [ ] Membership tiers (Free / paid), gated content access via RLS
- [ ] Stripe subscription billing (monthly/annual) with webhook sync
- [ ] Member profile: avatar, bio, social links, join date
- [ ] Custom domain support (CNAME-based, wildcard SSL via Let's Encrypt)

#### Spaces & Content
- [ ] Spaces (think: channels/groups) — open, members-only, or tier-gated
- [ ] Rich-text post editor (TipTap: bold, italic, code, images, embeds)
- [ ] Threaded comments on posts
- [ ] Emoji reactions on posts and comments
- [ ] Post pinning by community owner
- [ ] Image uploads via Supabase Storage (max 20MB per file)

#### Realtime Feed
- [ ] Live feed updates via Supabase Realtime (Broadcast + Postgres Changes)
- [ ] Realtime presence (who's online right now) in a Space
- [ ] Live comment counter on posts

#### Admin Dashboard
- [ ] Member list with search, filter by tier, ban/remove
- [ ] Post moderation (hide, delete, pin)
- [ ] Spaces management (create, edit, delete, reorder)
- [ ] Basic analytics: member count, posts/week, active members

### P1 — Should Have (High-value fast follow)

#### Direct Messaging
- [ ] 1:1 DMs between members via Supabase Realtime
- [ ] Unread message badge
- [ ] Message reactions and reply threading

#### Courses/Modules
- [ ] Course structure inside a Space (sections → lessons)
- [ ] Lesson types: text, video embed (YouTube/Loom URL), file download
- [ ] Progress tracking per member (% complete)
- [ ] Completion certificate (PDF generated via Puppeteer)

#### Notifications
- [ ] In-app notification center (mentions, replies, new posts in followed Spaces)
- [ ] Email notifications via Resend (configurable per-member)
- [ ] pg_cron weekly digest email to all members

#### Events
- [ ] Event creation with date/time, description, RSVP limit
- [ ] RSVP system with attendee list
- [ ] Zoom/Google Meet link embed
- [ ] Calendar view of upcoming events

### P2 — Future Considerations (Architectural insurance)

- Leaderboard / gamification (points, badges) — design DB to support `member_points` table early
- Native mobile app (React Native) — API-first design supports this
- Community marketplace / directory — multi-community support
- AI moderation hooks — webhook-ready architecture supports future LLM plugins
- Multi-language / i18n — use i18next-compatible string keys from V1

---

## 7. System Architecture

### Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                  │
│  Next.js 15 (App Router, RSC, TanStack Query, Supabase Realtime JS) │
│  Hosted: Vercel                                                       │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS / WebSocket
┌────────────────────────────▼────────────────────────────────────────┐
│                      API GATEWAY (NestJS)                            │
│  Route aggregation · Rate limiting · Request validation              │
│  JWT verification via Supabase Auth · Swagger docs                  │
│  Hosted: Railway / Render (Docker)                                   │
└───┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┘
    │          │          │          │          │          │
   NATS Message Bus (Inter-service async communication)
    │          │          │          │          │          │
┌───▼──┐  ┌───▼──┐  ┌────▼──┐  ┌───▼──┐  ┌───▼──┐  ┌───▼──────┐
│Auth  │  │Comm  │  │Chatting│  │Memb  │  │Media │  │Notif     │
│Svc   │  │unity │  │Service │  │ership│  │Svc   │  │Service   │
│      │  │Svc   │  │        │  │Svc   │  │      │  │          │
│NestJS│  │NestJS│  │NestJS  │  │NestJS│  │NestJS│  │NestJS    │
│:3001 │  │:3002 │  │:3003   │  │:3004 │  │:3005 │  │:3006     │
└──┬───┘  └──┬───┘  └────┬───┘  └──┬───┘  └──┬───┘  └──┬───────┘
   │         │           │         │          │          │
┌──▼─────────▼───────────▼─────────▼──────────▼──────────▼──────────┐
│                     SUPABASE LAYER                                   │
│                                                                      │
│  PostgreSQL (Primary DB, RLS)    Supabase Realtime (WebSocket)      │
│  Supabase Auth (JWT, OAuth)      Supabase Storage (Files, Images)   │
│  Supabase Edge Functions         pg_cron (Scheduled jobs)           │
└──────────────────────────────────────────────────────────────────────┘
```

### Architecture Decision Record (ADR-001): Microservices vs Monolith

**Status:** Accepted  
**Context:** Community platform has distinct bounded contexts (auth, posts, chat, billing, media, notifications) that benefit from independent scaling. Chat under heavy load should not affect post feed performance.

**Decision:** Use NestJS microservices with NATS as the message broker. Services communicate via NATS for async events and direct HTTP through the API Gateway for sync requests.

**Why NOT pure monolith:**
- Chat service under high load (Realtime WebSocket connections) would contend with post-serving traffic
- Notification service (email dispatch, pg_cron) can be deployed independently and scaled to zero when idle
- Media service handles large uploads with stream processing — isolating it prevents memory pressure on other services

**Why NOT Kubernetes (V1):**
- Overkill for initial deployment. Docker Compose → Docker Swarm path is sufficient to $50K MRR.
- Railway/Render handle orchestration for paid plans.

**Trade-offs:**
| Dimension | Microservices | Monolith |
|-----------|--------------|---------|
| Initial complexity | Higher | Lower |
| Independent scaling | ✅ Per-service | ❌ All-or-nothing |
| Deployment | Docker per service | Single container |
| Latency | +1–5ms inter-service | 0ms |
| Team fit | Medium (Claude Code sub-agents) | Low |

**Consequences:** NATS adds ~5ms per inter-service call. Accepted trade-off for independent scalability.

---

### Technology Stack Reference

| Layer | Technology | Why |
|-------|------------|-----|
| Frontend | Next.js 15 (App Router) | RSC for SEO, streaming, route groups for multi-tenant |
| UI Components | shadcn/ui + Tailwind CSS | Design system built on Radix UI primitives |
| Data Fetching | TanStack Query v5 | Server state, cache invalidation, optimistic updates |
| Realtime Client | Supabase JS v2 | Realtime subscriptions, presence, auth |
| API Gateway | NestJS + @nestjs/swagger | REST + Swagger docs, rate limiting, auth middleware |
| Microservices | NestJS + NATS transport | Typed message patterns, DI, decorators |
| Message Bus | NATS JetStream | Async inter-service events, at-least-once delivery |
| Database | Supabase PostgreSQL | ACID, RLS, Realtime, full-text search |
| Auth | Supabase Auth | JWT, OAuth, magic links, RLS integration |
| File Storage | Supabase Storage | S3-compatible, CDN, RLS-gated buckets |
| Scheduled Jobs | pg_cron + Edge Functions | Digest emails, streak rollover, cleanup |
| Containerization | Docker + Docker Compose | Multi-stage builds, dev/prod parity |
| CI/CD | GitHub Actions | Lint → Test → Build → Deploy pipeline |
| Frontend Hosting | Vercel | Edge SSR, preview deployments |
| Backend Hosting | Railway (production) | Docker-native, auto-scaling per service |
| Email | Resend | Transactional + broadcast emails |
| Payments | Stripe | Subscriptions, webhooks, customer portal |
| Language | TypeScript 5.x (strict) | End-to-end type safety, monorepo path aliases |
| Monorepo | Turborepo + pnpm workspaces | Shared types, shared config, parallel builds |

---

## 8. Database Schema (Supabase / PostgreSQL)

### Core Tables

```sql
-- TENANTS (one per NexusHub deployment, or multi-tenant future)
CREATE TABLE tenants (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,  -- subdomain/domain slug
  name         TEXT NOT NULL,
  domain       TEXT,                   -- custom domain (e.g. community.mysite.com)
  logo_url     TEXT,
  accent_color TEXT DEFAULT '#6366F1',
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- MEMBERSHIP TIERS
CREATE TABLE membership_tiers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,           -- 'Free', 'Pro', 'VIP'
  price_cents INTEGER NOT NULL DEFAULT 0,
  interval    TEXT DEFAULT 'month',    -- 'month' | 'year'
  stripe_price_id TEXT,
  is_free     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- PROFILES (extends Supabase Auth users)
CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id    UUID REFERENCES tenants(id),
  username     TEXT UNIQUE,
  display_name TEXT,
  bio          TEXT,
  avatar_url   TEXT,
  tier_id      UUID REFERENCES membership_tiers(id),
  stripe_customer_id TEXT,
  is_owner     BOOLEAN DEFAULT false,
  is_banned    BOOLEAN DEFAULT false,
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- SPACES (channels/groups)
CREATE TABLE spaces (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  description TEXT,
  icon        TEXT DEFAULT '💬',
  type        TEXT DEFAULT 'discussion', -- 'discussion' | 'course' | 'events' | 'directory'
  is_private  BOOLEAN DEFAULT false,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

-- SPACE ACCESS (which tiers can access which spaces)
CREATE TABLE space_tier_access (
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  tier_id  UUID REFERENCES membership_tiers(id) ON DELETE CASCADE,
  PRIMARY KEY (space_id, tier_id)
);

-- POSTS
CREATE TABLE posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id     UUID REFERENCES spaces(id) ON DELETE CASCADE,
  author_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title        TEXT,
  body         TEXT NOT NULL,               -- TipTap JSON stored as JSONB
  body_text    TEXT GENERATED ALWAYS AS (body::TEXT) STORED,  -- for FTS
  is_pinned    BOOLEAN DEFAULT false,
  is_hidden    BOOLEAN DEFAULT false,
  comment_count INTEGER DEFAULT 0,          -- denormalized for perf
  reaction_count INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Full-text search index on posts
CREATE INDEX posts_fts_idx ON posts USING GIN(to_tsvector('english', body_text));

-- COMMENTS
CREATE TABLE comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
  parent_id  UUID REFERENCES comments(id) ON DELETE CASCADE,  -- threading
  author_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  body       TEXT NOT NULL,
  is_hidden  BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- REACTIONS (emoji reactions on posts and comments)
CREATE TABLE reactions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id  UUID NOT NULL,             -- post or comment ID
  target_type TEXT NOT NULL,            -- 'post' | 'comment'
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  emoji      TEXT NOT NULL DEFAULT '👍',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(target_id, target_type, user_id, emoji)
);

-- DIRECT MESSAGES
CREATE TABLE dm_threads (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE dm_participants (
  thread_id UUID REFERENCES dm_threads(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (thread_id, user_id)
);

CREATE TABLE dm_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id  UUID REFERENCES dm_threads(id) ON DELETE CASCADE,
  sender_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  body       TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- COURSES (inside a Space of type 'course')
CREATE TABLE course_sections (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  title    TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE course_lessons (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES course_sections(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  type       TEXT DEFAULT 'text',  -- 'text' | 'video' | 'download'
  content    JSONB,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE lesson_progress (
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id  UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

-- EVENTS
CREATE TABLE events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id    UUID REFERENCES spaces(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ,
  location_url TEXT,  -- Zoom/Meet link
  rsvp_limit  INTEGER,
  created_by  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE event_rsvps (
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,  -- 'mention' | 'reply' | 'new_post' | 'reaction'
  actor_id    UUID REFERENCES profiles(id),
  target_id   UUID,           -- post/comment ID
  target_type TEXT,
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- MEMBER POINTS (P2 - gamification scaffold)
CREATE TABLE member_points (
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  total_points INTEGER DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT now()
);
```

---

## 9. Microservices Design

### Service Breakdown

```
apps/
├── gateway/           # API Gateway — NestJS, port 3000
├── auth-service/      # Auth + Profiles — port 3001
├── community-service/ # Spaces + Posts + Comments + Reactions — port 3002
├── chat-service/      # DMs + Realtime presence — port 3003
├── membership-service/# Tiers + Stripe + Webhooks — port 3004
├── media-service/     # File uploads → Supabase Storage — port 3005
└── notification-service/ # Emails + In-app notifications — port 3006
```

### Service Contracts (NATS message patterns)

```typescript
// Shared types package: packages/shared-types/

export interface ServiceEvents {
  // Auth Service publishes
  'user.created':    { userId: string; tenantId: string; email: string };
  'user.banned':     { userId: string; tenantId: string };

  // Community Service publishes
  'post.created':    { postId: string; spaceId: string; authorId: string; tenantId: string };
  'comment.created': { commentId: string; postId: string; authorId: string; mentionedIds: string[] };

  // Membership Service publishes
  'subscription.activated': { userId: string; tierId: string; stripeSubId: string };
  'subscription.cancelled': { userId: string; tierId: string };

  // Media Service publishes
  'upload.completed': { fileUrl: string; bucket: string; userId: string };
}
```

### API Gateway Service

```typescript
// apps/gateway/src/app.module.ts
@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),  // 100 req/min default
    ClientsModule.register([
      {
        name: 'COMMUNITY_SERVICE',
        transport: Transport.NATS,
        options: { servers: [process.env.NATS_URL] },
      },
      // ... other services
    ]),
    AuthModule,
    HealthModule,
  ],
})
export class AppModule {}
```

**Gateway responsibilities:**
- JWT validation via Supabase Auth (validate JWT against Supabase JWKS endpoint)
- Rate limiting per IP and per user
- Request/response logging (Pino)
- Swagger aggregation
- Route fan-out to microservices via NATS

### Auth Service (port 3001)

**Wraps Supabase Auth.** Does NOT duplicate auth logic — delegates entirely to Supabase, then enriches with profile data.

Key endpoints (via Gateway):
- `GET /profiles/me` — Current user profile + tier
- `PUT /profiles/me` — Update display name, bio, avatar
- `GET /profiles/:username` — Public profile view
- `GET /profiles` — Member directory (admin)

```typescript
// auth-service: Supabase JWT validation guard
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException();

    const { data: { user }, error } = await this.supabase.client.auth.getUser(token);
    if (error || !user) throw new UnauthorizedException();

    request.user = user;
    return true;
  }
}
```

### Community Service (port 3002)

**Core of the product.** Handles all Spaces, Posts, Comments, Reactions.

Key endpoints:
- `GET /spaces` — List all spaces user has access to
- `POST /spaces` — Create space (owner only)
- `GET /spaces/:slug/posts` — Paginated post feed (cursor-based)
- `POST /spaces/:slug/posts` — Create post
- `POST /posts/:id/comments` — Add comment
- `POST /posts/:id/reactions` — Toggle reaction
- `GET /posts/search?q=` — Full-text search (Postgres tsvector)

**Feed pagination — cursor-based for Realtime:**
```typescript
// community-service: cursor pagination
async getSpacePosts(spaceSlug: string, cursor?: string, limit = 20) {
  const query = this.supabase
    .from('posts')
    .select('*, author:profiles(id,display_name,avatar_url)')
    .eq('space_id', spaceId)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (cursor) {
    query.lt('created_at', cursor);  // before cursor timestamp
  }

  return query;
}
```

### Chat Service (port 3003)

Handles DMs and Realtime presence. Uses Supabase Realtime Broadcast for DM delivery (not Postgres Changes — lower latency, no DB write on every keystroke).

Key endpoints:
- `GET /dms` — List DM threads with latest message
- `GET /dms/:threadId/messages` — Paginated message history
- `POST /dms` — Create or get existing thread with a user

**Realtime presence:**
```typescript
// Frontend: Supabase presence for online status
const spaceChannel = supabase.channel(`space:${spaceId}`, {
  config: { presence: { key: userId } },
});

spaceChannel
  .on('presence', { event: 'sync' }, () => {
    const state = spaceChannel.presenceState();
    setOnlineMembers(Object.keys(state));
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await spaceChannel.track({ userId, displayName });
    }
  });
```

### Membership Service (port 3004)

Handles Stripe integration, tier management, and access control.

**Stripe webhook flow:**
```
Stripe → POST /webhooks/stripe → Membership Service
  → checkout.session.completed → activate tier → publish 'subscription.activated'
  → customer.subscription.deleted → downgrade to free → publish 'subscription.cancelled'
  → invoice.payment_failed → notify user → grace period 7 days
```

Key endpoints:
- `GET /tiers` — List membership tiers for a community
- `POST /tiers` — Create tier (owner only)
- `POST /checkout` — Create Stripe checkout session → return URL
- `GET /billing/portal` — Stripe customer portal URL

### Media Service (port 3005)

Thin service that handles upload-signing and metadata. Actual files go to Supabase Storage (never through the service).

**Upload flow:**
```
1. Client → Media Service: POST /uploads/sign { fileName, contentType, bucket }
2. Media Service → Supabase Storage: createSignedUploadUrl()
3. Media Service → Client: { signedUrl, path }
4. Client → Supabase Storage CDN: PUT signedUrl (direct, skips service)
5. Client → Community Service: use storage path in post body
```

**Storage buckets:**
- `avatars` — Public read, owner-write
- `post-media` — RLS-gated by space access
- `course-files` — RLS-gated by tier

### Notification Service (port 3006)

Subscribes to NATS events. Writes to `notifications` table (in-app) and dispatches email via Resend.

```typescript
// notification-service: NATS event subscription
@EventPattern('comment.created')
async handleCommentCreated(@Payload() data: CommentCreatedEvent) {
  // 1. Create in-app notification for post author + mentioned users
  await this.createNotification({
    userId: data.postAuthorId,
    type: 'reply',
    actorId: data.authorId,
    targetId: data.commentId,
  });

  // 2. Send email if user has email_notifications enabled
  const pref = await this.getNotifPreference(data.postAuthorId);
  if (pref.email_replies) {
    await this.resend.emails.send({
      from: 'notifications@community.com',
      to: postAuthor.email,
      subject: `${actor.displayName} replied to your post`,
      html: this.emailTemplate('reply', { ... }),
    });
  }
}
```

**pg_cron weekly digest** (Supabase Edge Function, scheduled weekly):
```sql
SELECT cron.schedule(
  'weekly-digest',
  '0 9 * * 1',  -- 9am every Monday
  $$SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-weekly-digest',
    headers := '{"Authorization": "Bearer SERVICE_ROLE_KEY"}'
  )$$
);
```

---

## 10. Frontend Architecture (Next.js 15)

### Project Structure

```
apps/web/
├── app/
│   ├── (auth)/                    # Route group: public auth pages
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (community)/               # Route group: authenticated app
│   │   ├── layout.tsx             # Sidebar + nav (Server Component)
│   │   ├── feed/page.tsx          # Global feed (RSC + Suspense)
│   │   ├── spaces/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx       # Space feed
│   │   │       └── posts/
│   │   │           └── [postId]/page.tsx
│   │   ├── messages/page.tsx      # DM inbox (Client Component)
│   │   ├── courses/[spaceSlug]/page.tsx
│   │   └── events/page.tsx
│   ├── (admin)/                   # Route group: owner admin panel
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── members/page.tsx
│   │   ├── spaces/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── auth/callback/route.ts # Supabase OAuth callback
│   │   └── webhooks/stripe/route.ts
│   └── layout.tsx
├── components/
│   ├── feed/
│   │   ├── PostCard.tsx           # Client Component (reactions, realtime count)
│   │   ├── PostEditor.tsx         # TipTap rich editor
│   │   └── RealtimeFeed.tsx       # Supabase Realtime subscription
│   ├── ui/                        # shadcn/ui re-exports
│   └── layout/
│       ├── Sidebar.tsx
│       └── TopNav.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser Supabase client
│   │   └── server.ts              # Server Supabase client (cookies)
│   └── api/
│       └── queries.ts             # TanStack Query hooks
└── middleware.ts                  # Auth check, custom domain routing
```

### Key Next.js 15 Patterns

**RSC Feed Page (no client JS for initial load):**
```typescript
// app/(community)/spaces/[slug]/page.tsx — Server Component
import { createServerClient } from '@/lib/supabase/server';

export default async function SpacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;  // Next.js 15: params is async
  const supabase = createServerClient();

  const { data: posts } = await supabase
    .from('posts')
    .select('*, author:profiles(*), _count:comments(count)')
    .eq('space.slug', slug)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div>
      <Suspense fallback={<PostSkeleton />}>
        <PostList initialPosts={posts} spaceSlug={slug} />
      </Suspense>
    </div>
  );
}
```

**Realtime Feed Client Component:**
```typescript
// components/feed/RealtimeFeed.tsx — Client Component
'use client';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@/lib/supabase/client';

export function RealtimeFeed({ spaceId }: { spaceId: string }) {
  const queryClient = useQueryClient();
  const supabase = createBrowserClient();

  useEffect(() => {
    const channel = supabase
      .channel(`space-posts:${spaceId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'posts',
        filter: `space_id=eq.${spaceId}`,
      }, (payload) => {
        // Optimistically prepend new post to TanStack Query cache
        queryClient.setQueryData(['posts', spaceId], (old: Post[]) =>
          [payload.new as Post, ...old]
        );
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [spaceId]);

  return null;  // Invisible component — just the subscription
}
```

**TanStack Query data fetching hook:**
```typescript
// lib/api/queries.ts
export const useSpacePosts = (spaceSlug: string) => {
  return useInfiniteQuery({
    queryKey: ['posts', spaceSlug],
    queryFn: async ({ pageParam }) => {
      const res = await fetch(
        `/api/spaces/${spaceSlug}/posts?cursor=${pageParam ?? ''}`
      );
      if (!res.ok) throw new Error('Failed to fetch posts');
      return res.json() as Promise<PaginatedPosts>;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 30,  // 30 seconds fresh — Realtime handles live updates
  });
};
```

**Multi-tenant middleware (custom domain routing):**
```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') ?? '';

  // Map custom domain → tenant slug
  // e.g., community.mysite.com → tenant slug lookup
  const isCustomDomain = !hostname.includes('nexushub.app');

  if (isCustomDomain) {
    const tenantSlug = await getTenantByDomain(hostname);
    if (!tenantSlug) return NextResponse.next();
    // Rewrite to tenant-specific route
    return NextResponse.rewrite(
      new URL(`/t/${tenantSlug}${req.nextUrl.pathname}`, req.url)
    );
  }

  return NextResponse.next();
}
```

### UI Design System

**Stack:** shadcn/ui + Tailwind CSS + Radix UI primitives  
**Style:** Minimalist with subtle gradients — clean, professional, similar to Linear/Vercel aesthetic  
**Font Pairing:** Geist Sans (headings) + Inter (body) — professional SaaS feel  
**Color Token System:**
```css
/* CSS variables — theming per tenant accent color */
:root {
  --accent: 99 102 241;       /* Default indigo — overridden per tenant */
  --accent-foreground: 255 255 255;
  --background: 255 255 255;
  --foreground: 9 9 11;
  --muted: 244 244 245;
  --border: 228 228 231;
}
```

---

## 11. Supabase Integration Strategy

### RLS Policies (Row Level Security)

**These are the security core of the product. Every table gets RLS.**

```sql
-- Enable RLS on all tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_messages ENABLE ROW LEVEL SECURITY;

-- Posts: visible to members who have access to the space
CREATE POLICY "posts_read" ON posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM spaces s
      LEFT JOIN space_tier_access sta ON sta.space_id = s.id
      LEFT JOIN profiles p ON p.id = auth.uid()
      WHERE s.id = posts.space_id
        AND (
          s.is_private = false  -- open space
          OR p.is_owner = true  -- community owner
          OR sta.tier_id = p.tier_id  -- member has the right tier
        )
    )
  );

-- Posts: only author or owner can edit
CREATE POLICY "posts_update" ON posts FOR UPDATE
  USING (author_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true
  ));

-- DMs: only participants can read messages
CREATE POLICY "dm_messages_read" ON dm_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dm_participants
      WHERE thread_id = dm_messages.thread_id
        AND user_id = auth.uid()
    )
  );
```

### Supabase Storage Buckets

```sql
-- avatars bucket: public read
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- post-media: authenticated read via RLS
INSERT INTO storage.buckets (id, name, public) VALUES ('post-media', 'post-media', false);

CREATE POLICY "post_media_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'post-media' AND auth.role() = 'authenticated');

CREATE POLICY "post_media_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Realtime Channels Strategy

| Channel | Type | Used For |
|---------|------|---------|
| `space-posts:{spaceId}` | Postgres Changes | New post notifications in space feed |
| `space-presence:{spaceId}` | Presence | Who's online in a Space |
| `dm-thread:{threadId}` | Broadcast | Real-time DM delivery |
| `notifications:{userId}` | Broadcast | In-app notification badge |

### Edge Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `send-weekly-digest` | pg_cron (Monday 9am) | Weekly email to all members |
| `process-stripe-webhook` | HTTP POST | Stripe event processing |
| `generate-certificate` | HTTP POST | PDF course completion cert |
| `cleanup-old-notifications` | pg_cron (daily) | Delete read notifs > 90 days |

---

## 12. CI/CD Pipeline

### Repository Structure (Turborepo Monorepo)

```
nexushub/
├── apps/
│   ├── web/              # Next.js 15 frontend
│   ├── gateway/          # API Gateway
│   ├── auth-service/
│   ├── community-service/
│   ├── chat-service/
│   ├── membership-service/
│   ├── media-service/
│   └── notification-service/
├── packages/
│   ├── shared-types/     # Shared TypeScript interfaces
│   ├── shared-config/    # Shared ESLint, tsconfig, Prettier
│   └── database/         # Supabase migrations + seed scripts
├── .claude/
│   └── agents/           # Claude Code sub-agent configs (see §13)
├── docker-compose.yml    # Full local dev stack
├── docker-compose.prod.yml
├── turbo.json
└── .github/
    └── workflows/
        ├── ci.yml
        ├── deploy-frontend.yml
        └── deploy-services.yml
```

### GitHub Actions Workflows

#### `ci.yml` — Runs on every PR

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]

jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo typecheck  # runs in all packages in parallel

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo lint

  test:
    runs-on: ubuntu-latest
    services:
      nats:
        image: nats:latest
        ports: ['4222:4222']
    env:
      NATS_URL: nats://localhost:4222
      SUPABASE_URL: ${{ secrets.SUPABASE_URL_TEST }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY_TEST }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo test -- --passWithNoTests

  build:
    runs-on: ubuntu-latest
    needs: [typecheck, lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo build
      - name: Build Docker images (verify they compile)
        run: |
          docker build -f apps/gateway/Dockerfile --target production .
          docker build -f apps/community-service/Dockerfile --target production .
```

#### `deploy-frontend.yml` — Deploys to Vercel on push to `main`

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths: ['apps/web/**', 'packages/shared-types/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: apps/web
          vercel-args: '--prod'
```

#### `deploy-services.yml` — Deploys microservices to Railway on push to `main`

```yaml
name: Deploy Microservices

on:
  push:
    branches: [main]
    paths-ignore: ['apps/web/**']

jobs:
  deploy-gateway:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy gateway to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          service: nexushub-gateway

  deploy-community:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy community-service to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          service: nexushub-community

  # ... similar jobs for each microservice
```

### Docker Multi-Stage Builds (per service)

```dockerfile
# apps/community-service/Dockerfile
FROM node:22-alpine AS base
RUN corepack enable pnpm

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml turbo.json ./
COPY packages/shared-types/package.json packages/shared-types/
COPY apps/community-service/package.json apps/community-service/
RUN pnpm install --frozen-lockfile --filter community-service...

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY apps/community-service ./apps/community-service
RUN pnpm turbo build --filter=community-service

# Production stage — minimal image
FROM node:22-alpine AS production
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
COPY --from=builder --chown=nestjs:nodejs /app/apps/community-service/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER nestjs
EXPOSE 3002
CMD ["node", "dist/main.js"]
```

### Local Development Stack (Docker Compose)

```yaml
# docker-compose.yml
version: '3.9'
services:
  nats:
    image: nats:2.10-alpine
    ports: ['4222:4222', '8222:8222']

  gateway:
    build: { context: ., dockerfile: apps/gateway/Dockerfile, target: builder }
    command: pnpm --filter gateway run start:dev
    ports: ['3000:3000']
    environment:
      NATS_URL: nats://nats:4222
      SUPABASE_URL: ${SUPABASE_URL}
      SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY}
      SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}
    volumes:
      - ./apps/gateway/src:/app/apps/gateway/src
    depends_on: [nats]

  community-service:
    build: { context: ., dockerfile: apps/community-service/Dockerfile, target: builder }
    command: pnpm --filter community-service run start:dev
    ports: ['3002:3002']
    environment:
      NATS_URL: nats://nats:4222
      SUPABASE_URL: ${SUPABASE_URL}
      SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}
    volumes:
      - ./apps/community-service/src:/app/apps/community-service/src
    depends_on: [nats]

  # ... all other services follow same pattern

  web:
    build: { context: ., dockerfile: apps/web/Dockerfile, target: builder }
    command: pnpm --filter web run dev
    ports: ['3100:3000']
    environment:
      NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY}
      NEXT_PUBLIC_API_URL: http://gateway:3000
    volumes:
      - ./apps/web:/app/apps/web
```

---

## 13. Claude Code Sub-Agent Execution Plan

This section defines exactly how to build NexusHub using **Claude Code Dynamic Workflows** with parallel sub-agents. This is the implementation playbook.

### Overview

```
Orchestrator (claude --max-turns 100)
│
├── [PARALLEL WAVE 1 — Infrastructure & Shared]
│   ├── Sub-Agent A: Monorepo scaffold + shared-types package
│   ├── Sub-Agent B: Supabase schema migrations + RLS policies
│   └── Sub-Agent C: Docker Compose + NATS local setup
│
├── [PARALLEL WAVE 2 — Core Microservices]
│   ├── Sub-Agent D: API Gateway (NestJS + JWT guard + Swagger)
│   ├── Sub-Agent E: Auth Service (NestJS + Supabase Auth)
│   ├── Sub-Agent F: Community Service (Spaces + Posts + Comments)
│   ├── Sub-Agent G: Membership Service (Tiers + Stripe)
│   └── Sub-Agent H: Media Service (Upload signing + Storage)
│
├── [PARALLEL WAVE 3 — Secondary Services]
│   ├── Sub-Agent I: Chat Service (DMs + Realtime)
│   └── Sub-Agent J: Notification Service (NATS events + Resend)
│
└── [SEQUENTIAL WAVE 4 — Frontend]
    ├── Sub-Agent K: Next.js 15 setup + Supabase client + auth flows
    ├── Sub-Agent L: Feed + Spaces + Posts UI (RSC + Realtime)
    ├── Sub-Agent M: DMs + Notifications UI
    └── Sub-Agent N: Admin Dashboard
```

### CLAUDE.md Configuration (root of repo)

```markdown
# NexusHub — Claude Code Configuration

## Project Overview
Turborepo monorepo. NestJS microservices + Next.js 15 + Supabase.
See /docs/PRD.md for full spec.

## Sub-Agent Routing Rules

### Parallel Execution (Background Automatically)
- Database migrations and RLS policy writing
- Individual microservice scaffolding (all services are independent)
- Docker configuration
- Test suite generation per service
- Supabase Storage bucket and RLS setup

### Sequential (Must Be Serial)
- shared-types package MUST be built before any service that imports it
- Supabase migrations MUST run before any service tests that query the DB
- API Gateway MUST scaffold before frontend API hooks (need endpoint signatures)

### Chain Dependencies
1. shared-types → all services
2. Supabase migrations → service integration tests
3. API Gateway endpoints → TanStack Query hooks in frontend
4. Auth Service → Community Service (requires JWT guard)

## Model Routing for Sub-Agents
- CLAUDE_CODE_SUBAGENT_MODEL=claude-sonnet-4-6
- Complex architecture decisions: escalate to orchestrator
- Boilerplate generation (DTOs, tests, Dockerfiles): Haiku acceptable

## Code Standards
- TypeScript strict mode always
- No `any` types — use `unknown` + type guards
- NestJS: use constructor injection, never service locator
- All Supabase queries use typed client (supabase-js v2 with generated types)
- Tests: Vitest for unit, Supertest for E2E
- Commits: conventional commits (feat/fix/chore/docs)
```

### Sub-Agent CLAUDE.md Files (in `.claude/agents/`)

#### `.claude/agents/backend-service.md` (reused for each service)
```markdown
You are building a NestJS microservice for the NexusHub platform.

Required patterns:
1. Feature-based module organization (not layer-based)
2. Constructor injection only (never @Inject in methods)
3. All inputs validated with class-validator DTOs
4. All async errors handled via @UseFilters(HttpExceptionFilter)
5. NATS message patterns for inter-service communication
6. Supabase service injected via SupabaseModule (shared)
7. Swagger decorators on all controller methods
8. Unit tests for all service methods (Vitest)
9. E2E tests for all controller endpoints (Supertest)
10. Multi-stage Dockerfile at service root

Reference skills:
- nestjs-expert: controller/service/DTO patterns
- nestjs-best-practices: architecture rules arch-*, security-*, perf-*
- docker-expert: multi-stage build patterns
- typescript-expert: strict TypeScript patterns
```

### Prompt Templates for Each Wave

**Wave 1 — Launch in parallel:**
```bash
# Run these three simultaneously (Ctrl+B to background each)

claude "Scaffold the Turborepo monorepo for NexusHub at ~/nexushub.
Create: root package.json (pnpm workspaces), turbo.json (build/lint/test/typecheck pipelines),
packages/shared-types (all service interfaces from PRD §9), packages/shared-config (tsconfig base, eslint base).
Use claude-subagent-style: complete it fully, commit with 'chore: init monorepo scaffold'."

claude "Create all Supabase database migrations for NexusHub.
Use the schema from PRD §8. Create files in packages/database/migrations/.
Include: 001_init_tenants.sql, 002_profiles.sql, 003_spaces_posts.sql,
004_messaging.sql, 005_courses_events.sql, 006_notifications.sql.
Then write ALL RLS policies from PRD §14 in packages/database/rls/.
Test each policy with SQL comments showing expected behavior."

claude "Create docker-compose.yml and docker-compose.prod.yml for NexusHub.
Services: nats (nats:2.10-alpine), gateway, auth-service, community-service,
chat-service, membership-service, media-service, notification-service, web.
Dev: volume mounts for hot reload. Prod: production-optimized.
Include .env.example with all required env vars.
Add health checks for all services."
```

**Wave 2 — After Wave 1 completes:**
```bash
# Run all four service agents in parallel

claude "Build the API Gateway at apps/gateway/ for NexusHub.
NestJS with: ThrottlerModule (100/min default, 10/min for auth routes),
JWT validation guard using Supabase JWKS, request proxying to each service via NATS,
Swagger UI at /docs, Pino logging, health endpoint.
Proxy routes: /auth/* → auth-service, /spaces/* → community-service,
/messages/* → chat-service, /billing/* → membership-service, /uploads/* → media-service.
Full test suite. Multi-stage Dockerfile."

claude "Build the Community Service at apps/community-service/ for NexusHub.
Handles: Spaces CRUD, Posts (cursor-paginated feed), Comments (threaded),
Reactions (toggle). Use Supabase client for DB. Publish NATS events on post.created,
comment.created. Full-text search on posts via tsvector.
Implement cursor-based pagination from PRD §9. Full test suite."

claude "Build the Membership Service at apps/membership-service/ for NexusHub.
Handles: Membership tier CRUD, Stripe checkout session creation,
Stripe webhook processing (checkout.session.completed, subscription events),
customer portal URL generation. Publish NATS events on subscription.activated/cancelled.
Use Stripe SDK. Validate webhook signatures with raw body. Full test suite."

claude "Build the Auth Service at apps/auth-service/ for NexusHub.
Wraps Supabase Auth — does NOT re-implement auth.
Handles: profile CRUD (GET/PUT /profiles/me, GET /profiles/:username),
member directory, avatar upload trigger (delegates to Media Service via NATS).
Subscribe to user.created NATS event from Supabase webhooks to init profile.
Full test suite."
```

**Wave 4 — Sequential Frontend (one at a time, each depends on previous):**
```bash
# Step 1
claude "Set up Next.js 15 at apps/web/ for NexusHub.
App Router, TypeScript strict, Tailwind CSS, shadcn/ui init.
Supabase client (browser + server cookies variants).
Auth: login/signup pages, OAuth callback route, middleware with custom domain routing.
TanStack Query provider setup. Global layout with Sidebar + TopNav.
Use patterns from next-best-practices and tanstack-query-expert skills."

# Step 2 — after Step 1 completes
claude "Build the Feed, Spaces, and Posts UI for NexusHub (apps/web/).
RSC SpacePage that server-fetches initial posts. PostCard client component with
Realtime live updates (postgres_changes INSERT), reaction toggling with optimistic updates,
comment thread expansion. PostEditor using TipTap. RealtimeFeed invisible subscription
component. Online presence badge using Supabase Presence. Use shadcn/ui components."
```

---

## 14. Security & RLS Policies

### Security Checklist (from `nestjs-best-practices` skill, security-* rules)

- [ ] `security-validate-all-input` — All DTOs use class-validator. Global ValidationPipe in bootstrap.
- [ ] `security-auth-jwt` — JWT validated against Supabase JWKS on every authenticated request
- [ ] `security-rate-limiting` — ThrottlerModule: 100/min globally, 10/min on auth routes, 5/min on Stripe
- [ ] `security-sanitize-output` — Post bodies sanitized with DOMPurify before storage (XSS prevention)
- [ ] Helmet.js on all services — sets security headers (CSP, HSTS, X-Frame-Options)
- [ ] Stripe webhook signature validation — HMAC-SHA256 with raw body buffer
- [ ] CORS — whitelist community domains only; dynamic CORS for custom domains via tenant lookup
- [ ] Environment variables — never committed; `.env.example` documents all required vars
- [ ] Supabase service role key — NEVER exposed to frontend; used only in server-side service code
- [ ] File uploads — validate MIME type + extension + max size (20MB) at Media Service before signing

### Supabase RLS Summary

| Table | Anonymous | Authenticated Member | Owner |
|-------|-----------|---------------------|-------|
| `posts` | ❌ | ✅ if space access | ✅ All |
| `comments` | ❌ | ✅ if space access | ✅ All |
| `dm_messages` | ❌ | ✅ if participant | ❌ No read |
| `profiles` | Read (public fields) | ✅ Full own profile | ✅ All |
| `membership_tiers` | ✅ Read | ✅ Read | ✅ CUD |
| `notifications` | ❌ | ✅ Own only | ✅ All |
| `spaces` | Read (public spaces) | ✅ If tier access | ✅ All |

---

## 15. Success Metrics

### Leading Indicators (measurable within 1 week of launch)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Time to first post | < 30 minutes from signup | Log timestamp: account_created → first_post_created |
| API p95 latency | < 200ms (feed, posts, DMs) | Pino logs + Railway metrics |
| Realtime update lag | < 500ms (post → feed update) | Client-side timestamp delta |
| Feed initial load | < 1.2s LCP on 4G | Vercel Analytics + Web Vitals |
| Docker setup time | < 5 minutes cold | `time docker compose up` benchmark |

### Lagging Indicators (measurable after 30–90 days)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Community owner retention | > 80% at 30 days | `created_at` vs `last_seen_at` on profiles with `is_owner=true` |
| Member DAU/MAU | > 30% | Supabase `profiles.last_seen_at` tracking |
| Post-per-member/week | > 1 | `COUNT(posts) / COUNT(profiles)` |
| GitHub stars | > 500 in 90 days | GitHub API |
| Self-hosted deployments | > 50 in 90 days | Anonymous telemetry ping (opt-out) |

---

## 16. Open Questions

| # | Question | Owner | Blocking? |
|---|----------|-------|-----------|
| Q1 | Stripe vs Lemon Squeezy — which payment processor for V1? Lemon Squeezy is simpler but less flexible; Stripe is industry standard. | Ali | No — default to Stripe, swap is isolated to membership-service |
| Q2 | Custom domain SSL — automate Let's Encrypt via Caddy sidecar, or require users to point Cloudflare proxy? | Engineering | No — V1: document Cloudflare proxy approach; V2: Caddy |
| Q3 | NATS vs Redis for message bus? NATS JetStream has at-least-once delivery and replay. Redis Streams is simpler setup. | Engineering | No — default to NATS; Redis falls back |
| Q4 | Self-hosted Supabase vs Supabase Cloud for deployment docs? Self-hosted adds ~2 hours setup; Cloud is 10 min. | Ali | No — V1 docs target Supabase Cloud |
| Q5 | Video hosting — Cloudflare Stream (per-minute cost) vs YouTube embed (free, less control)? | Ali | No — V1: YouTube/Loom embed only |

---

## 17. Phased Timeline

### Phase 1 — Foundation (Week 1–2)
**Goal:** Running monorepo, all services scaffolded, Supabase schema live, Docker Compose working.

**Claude Code Execution:** Run Wave 1 + Wave 2 sub-agents (parallel).

Deliverables:
- [ ] Turborepo monorepo with all 6 microservices scaffolded
- [ ] Supabase schema deployed (all migrations run)
- [ ] RLS policies active on all tables
- [ ] Docker Compose: `docker compose up` starts full stack
- [ ] API Gateway routing to all services
- [ ] Swagger docs at `localhost:3000/docs`
- [ ] CI workflow (typecheck + lint + test) green on GitHub

### Phase 2 — Core Product (Week 3–5)
**Goal:** Community owner can create a community, invite members, post content.

**Claude Code Execution:** Run Wave 3 sub-agents, then Wave 4 Steps 1–2.

Deliverables:
- [ ] Auth: Email signup/login + Google OAuth working
- [ ] Spaces: Create, list, gate by membership tier
- [ ] Posts: Create with TipTap editor, feed with pagination
- [ ] Realtime: New posts appear live (< 500ms)
- [ ] Comments: Threaded with reactions
- [ ] Basic admin dashboard (members list, posts moderation)
- [ ] Stripe: Checkout flow, subscription activation

### Phase 3 — Full Feature Set (Week 6–8)
**Goal:** All P0 + P1 features complete, production-ready.

**Claude Code Execution:** Run Wave 4 remaining steps + all P1 feature agents.

Deliverables:
- [ ] DMs working with realtime delivery
- [ ] Courses module (sections → lessons → progress tracking)
- [ ] Events with RSVP
- [ ] Email notifications via Resend
- [ ] pg_cron weekly digest
- [ ] Custom domain support (Cloudflare CNAME docs)
- [ ] Full CI/CD: Vercel (frontend) + Railway (services) auto-deploy from `main`

### Phase 4 — Polish & Launch (Week 9–10)
**Goal:** Public GitHub release, documentation, demo community.

Deliverables:
- [ ] One-command deploy script (`npx create-nexushub@latest`)
- [ ] README with 5-minute quickstart
- [ ] Live demo community at `demo.nexushub.app`
- [ ] Self-hosting guide (Coolify / Railway / Render options)
- [ ] Video walkthrough (screen record with Loom)

---

## Appendix A — Environment Variables Reference

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # NEVER expose to frontend

# NATS
NATS_URL=nats://localhost:4222

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=notifications@yourdomain.com

# Next.js (public — safe to expose)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# App
BASE_URL=https://yourdomain.com
JWT_SECRET=your-secret  # Only used for inter-service tokens
```

## Appendix B — Skills Applied in This PRD

| Skill | Applied In |
|-------|-----------|
| `product-management:write-spec` | §2, §4, §5, §6, §15, §16 — PRD structure, user stories, requirements |
| `engineering:architecture` | §7 — ADR-001 format, trade-off table, system diagram |
| `nestjs-expert` | §9 — Service patterns, controller/guard code examples |
| `nestjs-best-practices` | §9, §14 — arch-*, security-*, micro-* rules applied |
| `docker-expert` | §12 — Multi-stage Dockerfile, docker-compose patterns |
| `next-best-practices` | §10 — App Router RSC patterns, async params, middleware |
| `tanstack-query-expert` | §10 — `useInfiniteQuery`, optimistic updates, staleTime config |
| `typescript-expert` | Throughout — strict mode, shared types package, no-any policy |
| `nodejs-best-practices` | §9, §7 — Framework selection reasoning (NestJS for enterprise DI) |
| `ui-ux-pro-max` | §10 — Design system, color tokens, font pairing, accessibility rules |
| `tailwind-best-practices` | §10 — CSS variables, utility-first approach |
| `vercel-react-best-practices` | §10 — RSC boundaries, Suspense patterns, data fetching strategy |
