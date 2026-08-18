# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A minimal Express API used as a teaching repo for a Claude Code course. It's intentionally small: an in-memory user store, a couple of routes, and a Node test suite. Some tests are grading checks for course exercises — see "Grading tests" below.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start the server with auto-restart on file changes (`node --watch server.js`)
- `npm start` — start the server normally
- `npm test` — run the full test suite (Node's built-in test runner)
- `npm test -- tests/users.test.js` — run a single test file
- `npm run lint` — run ESLint

CI (`.github/workflows/ci.yml`) runs `npm install`, `npm run lint`, and `npm test` on push/PR against Node 22.

## Architecture

- `server.js` — creates the Express app, mounts routers under `/users` and `/health`, and only calls `app.listen` when run directly (`require.main === module`). This lets tests `require("../server")` and drive it with `supertest` without opening a real port.
- `routes/` — one router file per resource. Routes handle HTTP concerns (params, body, status codes) and delegate all data access to `db/store.js`.
- `db/store.js` — a tiny in-memory data layer standing in for a real database. State resets on every server restart; it's plain module-level arrays/variables, not a class or singleton. Any new data operation should be added here as an exported function, not inlined in a route.
- `tests/` — Node's built-in `node:test` + `assert`, with `supertest` for HTTP assertions against the exported `app`.

## Grading tests — do not edit

`tests/update-user.test.js` and `tests/notes.test.js` are fixed grading checks for a course exercise (adding `PUT /users/:id` and writing a `NOTES.md`). They start red on purpose. Do not modify these files — implement the corresponding feature (route + store helper, or the `NOTES.md` write-up) until they pass, following the existing pattern of validating input, returning 404 for a missing resource, and routing all data access through `db/store.js`.
