# Deployment & Infrastructure Specification

## 1. Environment Overview

EzGame runs as a containerized Next.js standalone application backed by Supabase Realtime services.

### Production Environment Variables

```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://ezgame.io

# Supabase Realtime Credentials
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# Database Connection (Optional for persistent room records)
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<db_name>?schema=public
```

---

## 2. Docker Containerization

EzGame provides an optimized multi-stage `Dockerfile` using the official `oven/bun` image:

```dockerfile
# Stage 1: Dependency resolution
FROM oven/bun:1.2-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Stage 2: Application build
FROM oven/bun:1.2-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Stage 3: Minimal runner
FROM oven/bun:1.2-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["bun", "server.js"]
```

---

## 3. Health Checks & Monitoring

- Health Check Endpoint: `/api/health` returning `{ "status": "healthy", "timestamp": ... }`.
- Uptime SLA: 99.9% uptime target for the websocket gateway.
