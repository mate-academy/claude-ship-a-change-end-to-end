# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install dependencies
- `npm run dev` — run the server with auto-restart
- `npm test` — run tests (Node's built-in test runner)
- `node --test tests/update-user.test.js` — run a single test file
- `npm run lint` — run ESLint

## Architecture

Small Express API: `server.js` mounts routers from `routes/` (`/users`, `/health`), which call into `db/store.js` for data. `db/store.js` is an in-memory array, not a real database — data resets on restart.

`server.js` exports `app` without calling `.listen()` when required (only on direct run), so tests use `supertest` against it in-process.

New endpoints follow the same pattern: store functions in `db/store.js`, route handler in `routes/` doing validation (400) and not-found (404) checks, mounted in `server.js`.
