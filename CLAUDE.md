# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Commands

- `npm run dev` — start the API with `node --watch` (port from `PORT`, default 3000)
- `npm start` — start without watch
- `npm test` — run all tests with the built-in `node --test` runner
- `node --test tests/users.test.js` — run a single test file
- `node --test --test-name-pattern="404" ` — run tests matching a name
- `npm run lint` — ESLint (`eslint:recommended`, CommonJS)

CI (`.github/workflows/ci.yml`) runs `npm run lint` then `npm test` on Node 22 for every push and PR, so both must pass.

## Architecture

A small Express 4 API (CommonJS, no build step):

- `server.js` — builds the `app`, mounts `express.json()` and the routers (`/users`, `/health`). It only calls `listen` when run directly (`require.main === module`) and exports `app`, so tests import it via `supertest` without opening a port.
- `routes/*.js` — one Express router per resource, one handler per action. Handlers validate input and return JSON errors in the shape `{ error: "<message>" }` (400 for invalid input, 404 for a missing resource, 201 for create).
- `db/store.js` — in-memory data store standing in for a database; resets on restart. **All routes access data through this module** (never touch the arrays from a route). New data operations belong here as exported functions.
- `tests/` — `node:test` + `supertest` against the exported `app`. Store state is shared module-level state across tests in a process.

## Conventions

- IDs are numbers; route params are converted with `Number(req.params.id)` before calling the store.
- `tests/update-user.test.js` defines the expected behavior of `PUT /users/:id` (200 update, 404 unknown id, 400 missing field); do not edit that test file. The README also requires a committed `NOTES.md` for the course project.
- Course project context (see README): work on a branch, commit in logical units, self-review, and open a PR against the main course repo (not a fork). Keep PRs limited to intended files.
