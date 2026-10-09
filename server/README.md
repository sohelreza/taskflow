# TaskFlow — Server (BFF)

A Fastify Backend-For-Frontend handling OAuth 2.0 with PKCE and proxying authenticated GraphQL requests to GitHub.

See the [root README](../README.md) for architecture, setup, and running instructions.

## Scripts

- `npm run dev` — start the server (loads `.env`)
- `npm run dev:test` — start in TEST_MODE for Cypress (loads `.env.test`)
- `npm run build` — compile TypeScript to `dist/`
- `npm run start` — run compiled server

## Environment variables

See the root README for required variables and OAuth App setup.

## Architecture

- **In-memory session store** — `Map<sessionId, Session>`. Redis-ready for production (swap the Map for a client).
- **OAuth 2.0 with PKCE** — code_verifier/challenge stored in signed cookies during the handshake.
- **Session cookies** — httpOnly, signed, 7-day lifetime, scoped to same origin.
- **CSP, rate limiting, Helmet** — production hardening via Fastify plugins.
