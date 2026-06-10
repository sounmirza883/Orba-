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

## Code Standards
- TypeScript strict mode always
- No `any` types — use `unknown` + type guards
- NestJS: use constructor injection, never service locator
- All Supabase queries use typed client (supabase-js v2)
- Tests: Vitest for unit, Supertest for E2E
- Commits: conventional commits (feat/fix/chore/docs)
