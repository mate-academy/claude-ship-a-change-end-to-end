# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

A tiny Express REST API for a `users` resource, used as a course project for shipping a change end to end. Data lives in memory — there is no database.

## Layout

- `server.js` — app entry point; creates the Express app, mounts the routers (`/users`, `/health`), and only calls `listen` when run directly so tests can import `app`.
- `routes/` — one router per resource, one route per action:
  - `users.js` — the users resource (list, get one, create, update).
  - `health.js` — a liveness check at `GET /health`.
- `db/store.js` — the in-memory data store. It seeds a couple of users and hands out ids. **All data access goes through this module** — routes never touch the array directly. Data resets on every restart.
- `tests/` — grading tests using Node's built-in `node:test` runner and `supertest`. Do not edit the test files.

## How to run

- Tests: `npm test` (runs `node --test tests/`).
- Start the API: `node server.js` — listens on `PORT` (default `3000`).

### Windows / PowerShell note

If `npm` fails with an execution-policy error on `npm.ps1`, either allow local scripts once with
`Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`, or sidestep it by calling
`npm.cmd test` / running `node --test tests/` directly.

## Conventions

- Go through `db/store.js` for all reads and writes; keep the store's shape (`{ id, name, email }`) consistent.
- Parse the id from the URL with `Number(req.params.id)` (ids are numeric).
- Validate input with a presence check (`if (!name || !email)`), matching the existing `POST /users` handler.
- On error, respond with a JSON `{ error }` body and the right status: `400` for invalid input, `404` when a user doesn't exist. Return the resource JSON on success (`200` for reads/updates, `201` for create).
