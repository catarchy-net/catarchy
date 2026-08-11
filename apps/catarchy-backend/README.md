# Catarchy Backend

A type-safe API built with Elysia.js, deployable to Cloudflare Workers.

## Features

- **Elysia.js** - Fast, TypeScript-first web framework
- **Cloudflare Workers** - Serverless edge computing deployment
- **OpenAPI Documentation** - Auto-generated API docs at `/openapi`
- **CORS Configuration** - Environment-based origin control
- **Zod & Eden** - Runtime validation and type-safe client generation
- **Health Check** - Built-in health endpoint for monitoring

## Architecture

### Directory Structure

```
src/
├── index.ts           # Cloudflare Workers entry (fetch handler)
├── server.ts          # Local Bun dev server entry
├── app.ts             # Shared app factory
├── env.ts             # Environment validation schema
└── infra/
    └── health/        # Health check module
        └── index.ts   # GET /health endpoint
```

### Dual Runtime Support

- **Local Development**: `bun run dev` → Bun runtime on port 3000
- **Production**: `npx wrangler deploy` → Cloudflare Workers
- **Single source**: `app.ts` shared between both runtimes

### Key Files

- **`src/index.ts`** - Cloudflare Workers module handler
  - Validates `CORS_ORIGIN` environment variable (required)
  - Returns error if env is missing
- **`src/server.ts`** - Local Bun server
  - Loads `.env` file for development
  - Validates env with `process.exit(1)` on failure
- **`src/app.ts`** - Shared Elysia app factory
  - Routes: `GET /` (root), `GET /health` (health check)
  - OpenAPI docs auto-generated at `/openapi`
  - CORS enabled with configured origins

- **`src/env.ts`** - Zod environment schema
  - `CORS_ORIGIN`: comma-separated list of allowed URLs, transformed to array and validated as URLs

## Development

### Commands

```bash
# Start dev server (port 3000)
bun run dev

# Build for Workers
bun run build

# Deploy to Cloudflare Workers
bun run deploy

# Start in production mode locally
bun run start

# Format & type check
bun run format
bun run format:check
```

## Environment Variables

### Development (`.env`)

```env
CORS_ORIGIN=http://localhost:5173,...
```

### Production (Cloudflare Workers)

Set in Cloudflare dashboard: **Settings → Environment Variables**

```
CORS_ORIGIN=https://catarchy-frontend.pages.dev
```

**Note**: Multiple origins supported as comma-separated values:

```
CORS_ORIGIN=https://example.com,https://app.example.com
```

## API Endpoints

### Root

```
GET /
```

Response: `{ message: "Hello from Catarchy!" }`

### Health Check

```
GET /health
```

Response: `{ status: "ok" }`

### API Documentation

```
GET /openapi
```

Interactive OpenAPI documentation.

## Deployment

### Cloudflare Workers

```bash
bun run build
npx wrangler deploy
```

Then configure environment variables in Cloudflare dashboard.

### Configuration

**`wrangler.toml`**:

- `main = "src/index.ts"` - Entry point
- `compatibility_date = "2026-03-02"` - Workers API version

## Architecture Decisions

### Shared App Factory Pattern

- `app.ts` exports `createApp(config)` function
- Accepts both `adapter` (CloudflareAdapter) and `env` parameters
- Allows runtime-specific initialization without duplicating routes

### Environment Validation Strategy

- **Workers**: Validates once per request in fetch handler
- **Local**: Validates at startup, exits on failure
- Schema used by both to ensure consistency

### Modular Infra Structure

- `infra/health/` module for infrastructure concerns
- Easily extended with logging, monitoring, etc.

## Type Safety

Eden Treaty integration allows frontend to have **100% type-safe API calls**:

```typescript
// Frontend gets full type inference
const { data } = await api.health.get();
//     ↑ Automatically typed from backend routes
```

No manual API type definitions needed.
