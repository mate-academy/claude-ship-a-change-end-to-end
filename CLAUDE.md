# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A minimal Express API used as a teaching repo for a Claude Code course. It's intentionally tiny — the point of most tasks here is the workflow (planning, clean commits, review, PR), not the code complexity.

## Commands

- `npm install` — install dependencies
- `npm run dev` — run the server with auto-restart on change (`node --watch server.js`)
- `npm start` — run the server normally
- `npm test` — run all tests (Node's built-in test runner, via `node --test`)
- `npm run lint` — run ESLint over the whole repo

Run a single test file directly, e.g.:
```
node --test tests/update-user.test.js
```

There is no test watch mode; re-run `npm test` after changes.

## Architecture

- `server.js` — builds the Express `app`, mounts route modules, and only calls `app.listen` when run directly (`require.main === module`). This lets tests `require("../server")` and drive it with `supertest` without opening a real port.
- `routes/` — one router module per resource (e.g. `users.js`, `health.js`), mounted in `server.js` under a path prefix (`/users`, `/health`). Each route handler validates input itself and returns explicit status codes (400 for bad input, 404 for missing resources) rather than throwing.
- `db/store.js` — a tiny in-memory data layer that all routes go through instead of touching an array directly. Data resets on every server restart; there is no real database. New data access needs (e.g. an update-by-id helper) belong here, following the existing function style (`getAllUsers`, `getUserById`, `createUser`).
- `tests/` — uses Node's built-in `node:test` + `node:assert`, with `supertest` to drive the Express `app` in-process. Tests import `require("../server")` directly.

## Repo-specific conventions

- Grading/course tests (e.g. `tests/update-user.test.js`, `tests/notes.test.js`) are provided and must not be edited — implementation should be changed to make them pass, not the other way around.
- A `NOTES.md` at the project root is expected as part of course submissions, explaining the plan, model choice, commit split, and what review caught. `tests/notes.test.js` checks it exists and has real content (≥80 chars) — this is a course deliverable, not a general project convention.
- CI (`.github/workflows/ci.yml`) runs `npm install`, `npm run lint`, then `npm test` on push/PR — keep both green.
