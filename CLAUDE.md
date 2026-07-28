# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install dependencies
- `npm run dev` — run the server with `node --watch` (auto-restarts on change)
- `npm start` — run the server normally
- `npm test` — run all tests (Node's built-in test runner, via `node --test`)
- `npm test -- tests/update-user.test.js` — run a single test file
- `npm run lint` — run ESLint over the whole repo

There is no build step; this is plain CommonJS Node.js.

## Architecture

Small Express API with three layers:

- `server.js` — creates the Express app, mounts routers, only calls `app.listen` when run directly (`require.main === module`). This lets `tests/*.test.js` `require("../server")` and get the app without opening a real port.
- `routes/*.js` — one router per resource (`routes/users.js`, `routes/health.js`), mounted in `server.js` under a path prefix (e.g. `/users`). Routes handle HTTP concerns (status codes, validation of the request shape) and delegate data access to `db/store.js`.
- `db/store.js` — an in-memory data store standing in for a real database. State (e.g. the `users` array) resets on every server restart and is shared across requests via module-level variables. All data access goes through exported functions here (`getAllUsers`, `getUserById`, `createUser`, ...) — routes never touch the in-memory arrays directly.

Tests (`tests/*.test.js`) use Node's built-in `node:test` + `assert`, and `supertest` to make HTTP requests against the exported `app` without a real network port.

## Conventions

- New endpoints follow the existing users-resource pattern: validate input in the route handler, return 400 on missing/invalid fields, return 404 via `res.status(404).json({ error: "..." })` when a resource doesn't exist, and perform actual data mutation through a new `db/store.js` helper rather than inline.
- ESLint config (`.eslintrc.json`) extends `eslint:recommended`; unused-vars is a warning, with `req`, `res`, `next`, and `_`-prefixed args exempted.
- `.env` is git-ignored; copy `.env.example` to `.env` for local secrets. Currently only `PORT` is used.
- CI (`.github/workflows/ci.yml`) runs `npm install`, `npm run lint`, then `npm test` on every push/PR.

## Grading tests — do not edit

Some test files are provided as fixed acceptance criteria for course exercises and must not be modified:

- `tests/update-user.test.js` — expects `PUT /users/:id` to update a user (200), return 404 for an unknown id, and 400 when a field is missing.
- `tests/notes.test.js` — expects a `NOTES.md` at the project root with at least 80 characters of real content (plan, model choice, commit split, what review caught).

Implement against these tests rather than changing them.
