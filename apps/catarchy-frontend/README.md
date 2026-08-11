# Catarchy Frontend

Meow :3

[catarchy.net](https://catarchy.net)

## Architecture

**FSD Structure**:

```
src/
├── features/       # Feature modules (Feature Sliced Design)
├── shared/         # Shared utilities & API client
├── routes/         # TanStack Router pages (file-based)
├── app.tsx         # Root with QueryClient, Router
└── main.tsx        # Entry with env validation
```

## Dev

```bash
bun run dev          # Port 5173
bun run build
bun run format
bun run lint
```

## Environment

**Development** (`.env`):

```
VITE_API_URL=http://localhost:3000
VITE_REMILIA_CLIENT_ID=tpa-catarchy
```

**Production** (Cloudflare Workers dashboard):

```
VITE_API_URL=https://catarchy-backend.hjjam100.workers.dev
VITE_REMILIA_CLIENT_ID=tpa-catarchy
```

Register these exact Login client redirect URIs in the RemiliaNET developer
portal:

```text
http://localhost:5173/auth/sign-in
https://catarchy.net/auth/sign-in
```

## Deployment

```bash
bun run build
bunx wrangler pages deploy dist
```
