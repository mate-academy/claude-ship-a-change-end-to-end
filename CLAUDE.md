# CLAUDE.md

A minimal Express REST API with a health-check endpoint and an in-memory-backed /users resource supporting list, fetch-by-id, and create.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start the API with auto-reload on http://localhost:3000
- `npm start` — start the API without auto-reload
- `npm test` — run all tests
- `npm test -- --test-name-pattern="<name>"` — run a single test by name
- `npm run lint` — run ESLint

CI (`.github/workflows/ci.yml`) runs `npm install`, `npm run lint`, and `npm test` on every push and PR.

## Conventions

- Route handlers validate input and return JSON error bodies with appropriate status codes (400, 404) rather than throwing.
    - e.g. `{ error: "..." }`
- ESLint config extends `eslint:recommended` for Node/CommonJS, not ESM.

## Architecture

- `server.js` — Express app entry point. Mounts route modules and only calls `app.listen` when run directly
- `routes/` — one file per resource
    - `health.js` - A health check to ensure the API is accessible
    - `users.js` - Endpoints to interact with the in-memory data store
    - `status.js` - Reports the app's uptime
- `db/store.js` — in-memory data store standing in for a real database
- `tests/` — integration-style tests that exercise routes through the HTTP layer, not unit tests of individual functions.
