# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install dependencies
- `npm run dev` — run the server with auto-restart (`node --watch server.js`)
- `npm start` — run the server normally
- `npm test` — run all tests (Node's built-in test runner, `node --test`)
- `npx node --test tests/update-user.test.js` — run a single test file
- `npm run lint` — run ESLint

## Architecture

This is a small Express API used for a Claude Code course. It's intentionally minimal:

- `server.js` builds the Express `app` and mounts route modules; it only calls `app.listen` when run directly (`require.main === module`), so tests can `require("../server")` and exercise routes with `supertest` without opening a real port.
- `routes/*.js` — one router module per resource (`users.js`, `health.js`), mounted in `server.js` under a path prefix (e.g. `/users`). Handlers validate input and shape HTTP responses (status codes, error bodies) but contain no data logic themselves.
- `db/store.js` — the only place that touches data. It's an in-memory array standing in for a real database (state resets on every restart). Route handlers must go through its exported functions rather than mutating data directly; new data operations get a new exported function here.
- `tests/*.test.js` — Node's built-in `node:test` + `assert`, driving the app through `supertest`. Tests import `app` from `server.js` directly (no server process needed).

When adding an endpoint, follow the existing pattern: add/extend a helper in `db/store.js` for the data access, then add a route handler that validates input, calls the store helper, and returns the appropriate status code (400 for invalid input, 404 for a missing resource, etc.).

## Notes

- `.env` is git-ignored; copy `.env.example` to `.env` for local secrets (none are currently required — only `PORT` is used).
- CI (`.github/workflows/ci.yml`) runs `npm install`, `npm run lint`, and `npm test` on push/PR with Node 22.
