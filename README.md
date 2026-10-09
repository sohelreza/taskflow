# TaskFlow

A GraphQL-powered task manager built on GitHub Issues, demonstrating modern full-stack patterns in React 19, Apollo Client v4, and a Fastify BFF.

> **Status:** Portfolio project. Full OAuth, optimistic UI, E2E tested, deployed.

**Live demo:** [coming soon]
**Repo:** https://github.com/sohelreza/taskflow

---

## What this is

TaskFlow uses the GitHub GraphQL API as its backend — your real repositories and issues, surfaced through a product-focused UI. Sign in with GitHub, browse repos, create and close issues with instant feedback.

The point isn't to replace GitHub. The point is to demonstrate production patterns you'd use on any real app: proper authentication, optimistic UI, cache management, accessibility, testing.

---

## Highlights

### Full OAuth 2.0 with PKCE, server-side

GitHub tokens never touch the browser. A Fastify BFF holds the client secret, handles the OAuth code-exchange with PKCE, and stores session tokens server-side keyed by an httpOnly session cookie. Classic BFF pattern done right.

### Optimistic UI with Apollo cache surgery

Create or close an issue — the UI updates instantly, before the server responds. Uses `cache.modify` with `writeFragment` to insert into paginated lists, with duplicate-check via `readField` so optimistic and real responses don't produce dupes. Full dataState narrowing for Apollo v4 Suspense support.

### Modern React patterns

- Suspense boundaries for data fetching
- Error boundaries scoped per-route and globally
- Compound components (`<IssueList.Root>`, `<IssueList.Item>`, etc.)
- Custom hooks for mutations
- Split context (state vs actions) to minimize re-renders

### End-to-end testing with Cypress

Seven E2E specs covering auth, repo navigation, issue creation (including optimistic UI verification via delayed mocks), and filter behavior. Tests bypass OAuth via a `TEST_MODE` server escape hatch — real OAuth in tests is fragile and we have better options.

### Accessibility that actually works

- Semantic landmarks (`<main>`, `<nav>`)
- Skip link for keyboard users
- Form errors with `aria-invalid` + `aria-describedby`
- Live region announcements for optimistic UI updates
- Full keyboard navigation, focus trap on dialogs via Radix

### Production-shaped server

Fastify with Helmet, rate limiting (100/min per IP), structured error handling that doesn't leak internals, request IDs for log correlation, Content-Security-Policy headers.

---

## Tech stack

**Frontend**

- React 19 with Suspense & Error Boundaries
- Vite 7
- TypeScript (strict)
- Apollo Client v4 (useSuspenseQuery with dataState narrowing)
- TanStack Router (file-based, typed routes, URL-synced state)
- Tailwind CSS v4 + Shadcn UI (Radix primitives)
- react-hook-form + Zod
- GraphQL Code Generator (client preset)

**Backend (BFF)**

- Fastify 5 with plugins (`cookie`, `cors`, `helmet`, `rate-limit`)
- Node 24, TypeScript
- In-memory session store (Redis-ready)
- GitHub OAuth 2.0 with PKCE

**Testing**

- Cypress 16 for E2E
- GraphQL mocking via `cy.intercept` with fixtures
- Custom commands for shared setup

**Infra**

- npm workspaces monorepo
- [Deployment platforms — filled in Commit 51]

---

## Running locally

Requires Node 20+ and a GitHub OAuth App.

### 1. Register a GitHub OAuth App

Settings → Developer settings → OAuth Apps → New OAuth App.

- Homepage URL: `http://localhost:5173`
- Callback URL: `http://localhost:4000/auth/callback`

Save the Client ID and generate a Client Secret.

### 2. Clone and install

```bash
git clone https://github.com/sohelreza/taskflow.git
cd taskflow
npm install
```

### 3. Configure the server

Create `server/.env`:

```
PORT=4000
GITHUB_OAUTH_CLIENT_ID=your_client_id
GITHUB_OAUTH_CLIENT_SECRET=your_client_secret
COOKIE_SECRET=any_32_plus_character_random_string
FRONTEND_URL=http://localhost:5173
```

### 4. Run

In two terminals:

```bash

# Terminal 1: BFF

cd server && npm run dev

# Terminal 2: Client

cd client && npm run dev
```

Open http://localhost:5173.

---

## Running the E2E tests

The server has a `TEST_MODE` that bypasses OAuth for Cypress. Enable with `.env.test`:

```bash

# server/.env.test

PORT=4000
GITHUB_OAUTH_CLIENT_ID=test
GITHUB_OAUTH_CLIENT_SECRET=test
COOKIE_SECRET=test_cookie_secret_at_least_32_characters_long
FRONTEND_URL=http://localhost:5173
TEST_MODE=true
```

Then:

```bash

# Terminal 1

cd server && npm run dev:test

# Terminal 2

cd client && npm run dev

# Terminal 3

cd client && npm run cypress:run
```

---

## Honest scope notes

What's intentionally not here:

- **Pagination beyond basic Load More** — enough to demonstrate the pattern, not a full infinite scroll experience
- **Comments on issues** — would add significant GraphQL surface for diminishing demonstration value
- **Labels management** — the pattern is identical to issue mutations; built once, understood
- **Multi-user features** — single-user auth; no org switching, team views
- **Mobile-specific layout** — responsive but not mobile-optimized

What's intentionally simple:

- **Session store is in-memory** — Redis would be the production choice (one env var swap)
- **No refresh tokens** — GitHub OAuth tokens don't expire; refresh would be a different auth model
- **No background job processing** — not needed for the current feature set

The project aims to demonstrate pattern depth, not feature breadth.

---

## Project structure

```
taskflow/
├── client/ # React app
│ ├── src/
│ │ ├── components/ # UI components (IssueList, NewIssueDialog, Nav, ...)
│ │ ├── graphql/ # GraphQL operations
│ │ ├── gql/ # Codegen output (gitignored)
│ │ ├── hooks/ # Custom hooks (useCloseIssue, useCreateIssue)
│ │ ├── lib/ # Clients, auth context
│ │ └── routes/ # TanStack Router file-based routes
│ └── cypress/ # E2E tests
├── server/ # Fastify BFF
│ └── src/index.ts # OAuth + session + GraphQL proxy
└── package.json # npm workspaces root
```

---

## License

MIT
