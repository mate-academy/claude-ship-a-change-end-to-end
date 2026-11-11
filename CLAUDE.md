# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install deps (Express 4; dev: ESLint 8, supertest)
- `npm run dev` — run the server with `node --watch` (port `PORT` or 3000)
- `npm start` — run the server
- `npm test` — run all tests with Node's built-in runner (`node --test`)
- `node --test tests/users.test.js` — run one test file
- `node --test --test-name-pattern="404"` — run tests whose names match
- `npm run lint` — ESLint (`eslint:recommended`; unused `req`/`res`/`next`/`_` args are allowed)

CI (`.github/workflows/ci.yml`) runs `npm install`, `npm run lint`, then `npm test` on Node 22, on every push and PR.

## Architecture

- `server.js` builds the Express app, mounts `/users` and `/health` routers, and exports `app`. It only calls `listen()` when run directly (`require.main === module`), so tests can `require("../server")` and drive it with supertest without opening a port.
- `routes/*.js` — one Express Router per resource, one handler per action. Handlers parse `req.params.id` with `Number(...)`, validate the input inline, and return JSON errors in the form `{ error: "..." }` (400 for invalid input, 404 for a missing resource).
- `db/store.js` — an in-memory store (module-level `users` array + `nextId`, seeded with ids 1 and 2). **All data access goes through its exported functions.** Routes never touch the array directly. To add a data operation, add a function here and export it. State resets on restart. It is shared across tests within one file, because each test file runs in its own process.

## Project constraints

- `tests/update-user.test.js` and `tests/notes.test.js` are grading tests. Do not edit them. The current task is to implement `PUT /users/:id` (200 on update, 400 on a missing/invalid field, 404 for an unknown id) through a new `db/store.js` helper.
- `tests/notes.test.js` requires a root `NOTES.md` with at least 80 characters of content (plan, model choice, commit split, review findings).
- Work on a branch, use one logical change per commit, and open the PR against the upstream course repo, not a fork. See README.md for the full workflow.
- Modify files only with the Edit/Write tools, never via Bash (`sed -i`, `cat >`, etc.).
