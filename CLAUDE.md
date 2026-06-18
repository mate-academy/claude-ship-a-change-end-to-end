# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install dependencies (Node 22 in CI)
- `npm test` — run all tests (`node --test` auto-discovers `tests/`)
- `node --test tests/update-user.test.js` — run a single test file
- `node --test --test-name-pattern="404"` — run tests matching a name
- `npm run lint` — ESLint over the repo
- `npm run dev` — start the server with `--watch` (auto-restart on change)
- `npm start` — start the server once

CI (`.github/workflows/ci.yml`) runs `npm run lint` then `npm test` on every push and PR; both must pass.

## Architecture

A small Express REST API (CommonJS, no transpile step). Three layers:

- **`server.js`** — builds the `app`, registers `express.json()`, and mounts each resource router under its base path (`/users`, `/health`). It only calls `app.listen()` when run directly (`require.main === module`), so tests can `require("../server")` and get the `app` without binding a port. It exports `app`.
- **`routes/*.js`** — one Express `Router` per resource, one handler per action. Routers call into the store; they never hold data themselves.
- **`db/store.js`** — the single source of data access. An in-memory array of users with an auto-incrementing `nextId`, exposed through named helpers (`getAllUsers`, `getUserById`, `createUser`, …). State is module-level and **mutable**, shared across requests, and **resets on restart**. All persistence-shaped logic lives here — routes must go through it, not touch arrays directly.

### Route conventions (follow the existing handlers)

- Parse numeric ids with `Number(req.params.id)` before looking them up.
- Validate required body fields up front; respond `400` with `{ error: "..." }` when one is missing.
- When a lookup misses, respond `404` with `{ error: "..." }` — never let a missing record throw.
- Return `201` for creates, `200` for reads/updates, with the resource as JSON.

### Tests

`node:test` + `assert` + `supertest`, importing the exported `app` and asserting on real HTTP responses. The `update-user` and `notes` tests are grading tests for the course exercise — treat them as the spec and do not edit them; make them pass.

## Lint

ESLint extends `eslint:recommended`, `sourceType: "script"` (CommonJS `require`/`module.exports`, not ES modules). Unused-var warnings ignore `req`, `res`, `next`, and `_`-prefixed names.

## Context

This is a course exercise repo (see `README.md`). The current task is implementing `PUT /users/:id`: update an existing user, `400` on a missing/invalid field, `404` for an unknown id, all data access through `db/store.js`. A `NOTES.md` at the project root is also required by the grading tests.
