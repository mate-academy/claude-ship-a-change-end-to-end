# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # run with auto-reload (node --watch server.js)
npm start            # run the server (PORT env var, default 3000)
npm run lint         # ESLint over the whole repo
npm test             # run all tests (node --test, auto-discovers tests/)

# Run a single test file
node --test tests/update-user.test.js

# Run tests matching a name
node --test --test-name-pattern="updates an existing user"
```

CI (`.github/workflows/ci.yml`) runs `npm install` → `npm run lint` → `npm test` on Node 22 for every push and pull request.

## Architecture

A layered Express app. Source lives at the repo root — no `src/` directory.

**Request flow:** HTTP → `server.js` mount → `routes/*` handler → `db/store.js` → JSON response.

- **`server.js`** — entry point and wiring: creates the Express app, mounts `express.json()`, mounts routers at `/users` and `/health`, exports `app`. Calls `app.listen` only when run directly (`require.main === module`) so tests can `require("../server")` without opening a real port — do not remove this guard.
- **`routes/`** — each file is an `express.Router()`. Handlers own HTTP concerns (validation, status codes) and delegate all data access to the store.
- **`db/store.js`** — in-memory data layer (array + `nextId` counter). Non-persistent; resets on restart. Currently exposes `getAllUsers`, `getUserById`, `createUser`.

## Conventions

- **All data access goes through `db/store.js`.** Add a store helper function rather than mutating data inline in a route handler.
- Parse path params with `Number(req.params.id)`.
- Error response shapes to match: `404 → { error: "User not found" }`, `400 → { error: "name and email are required" }`. Status `201` on create.
- Tests use `node:test` + `node:assert` + `supertest` against the imported `app`, with flat `test(...)` calls (no describe blocks). ESLint config extends `eslint:recommended`, targets ES2022, CommonJS (`sourceType: "script"`).

## Current task

The assigned feature is a `PUT /users/:id` update endpoint (validate input → 400, unknown id → 404, update via a new store helper → 200). Failing tests are in `tests/update-user.test.js` — do not edit them. `tests/notes.test.js` also requires a `NOTES.md` file with at least 80 characters of content. Grading checks only `npm test`.
