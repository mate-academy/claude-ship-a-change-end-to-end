# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A minimal Express API used as a teaching repo for a Claude Code course. It's intentionally small: no database, no auth, no build step — just enough structure to practice a real end-to-end workflow (plan → implement → commit → review → PR).

## Commands

- `npm install` — install dependencies
- `npm run dev` — run the server with auto-restart (`node --watch server.js`), on `PORT` env var or 3000
- `npm start` — run the server without watch mode
- `npm test` — run all tests (Node's built-in test runner, `node --test`)
- `npm run lint` — run ESLint over the whole project

To run a single test file directly: `node --test tests/update-user.test.js`.

There is no separate typecheck step (plain JS, no TypeScript).

## Architecture

- `server.js` — builds the Express `app` and mounts routers; only calls `app.listen` when run directly (`require.main === module`), so `tests/*.test.js` can `require("../server")` and drive it in-process with `supertest` without opening a real port.
- `routes/` — one router file per resource (`users.js`, `health.js`), mounted in `server.js` under their path prefix. Each route handler stays thin: validate input, call into `db/store.js`, shape the response. Route handlers must never touch the `users` array directly — always call helpers exported from `db/store.js`.
- `db/store.js` — the single data-access layer. It's an in-memory array-backed store (data resets on restart) that stands in for a real database. New fields/behaviors on users should add a helper here rather than mutating state from a route.
- `tests/` — Node's built-in `node:test` + `supertest`, hitting the Express `app` in-process.

## Conventions

* **Code style**: CommonJS throughout (`require` / `module.exports`), double-quoted strings, semicolons.
* **Linter**: `.eslintrc.json` extends `eslint:recommended`, `sourceType: "script"` (CommonJS only — `import`/`export` will error). `no-unused-vars` is a warning, not an error; `req`, `res`, `next`, and `_`-prefixed args are exempt.
* **Route documentation**: prefix each route with a one-line comment stating the method, path, and action (e.g., `// GET /users/:id — fetch a single user, or 404 if it doesn't exist`).
* **Validation errors**: return status `400` with body `{ error: "<message>" }`.
* **Missing resources**: return status `404` with body `{ error: "User not found" }`.

## Pre-commit checklist

Run before committing any changes:
- `npm test`
- `npm run lint`