# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start the server with `node --watch` (port from `PORT`, default 3000)
- `npm test` — run all tests (Node's built-in `node --test` runner + supertest)
- `node --test tests/update-user.test.js` — run a single test file
- `node --test --test-name-pattern="<pattern>"` — run tests matching a name
- `npm run lint` — ESLint (`eslint:recommended`, CommonJS); CI runs lint then tests on Node 22

## Architecture

Small Express 4 API (CommonJS, no build step). It is the base repo for a course project series; see `README.md` for the current assignment (a `PUT /users/:id` endpoint, with a required `NOTES.md` that the tests check for).

- `server.js` — builds the `app`, mounts routers (`/users`, `/health`), registers a final error handler that answers with `{ error }` JSON (4xx kept, anything else a logged 500), and only calls `listen` when run directly (`require.main === module`). It exports `app` so tests import it via supertest without opening a port.
- `routes/*.js` — one Express router per resource, one handler per action. `:id` params are validated (format and range) by the `validateId` middleware, registered with `router.param("id", ...)`; handlers read the parsed id from `req.userId`, validate the body with `validateUserInput`, and respond with `{ error: "..." }` JSON and 400/404 status codes.
- `middleware/validateId.js` — `validateId(endpoints)` returns a `router.param` handler that validates `:id` only for the method/route pairs listed in `config.idValidatedEndpoints` (O(1) lookup: `{ METHOD: { "/route/:id": true } }`). **A new `:id` endpoint must be added to that map**, or its handler will get no `req.userId`. `HEAD` is validated as `GET`. Handlers add the `requireUserId` guard so a missing entry raises an explicit error instead of a misleading 404.
- `config.js` — `maxUserId` (highest accepted id; `store.createUser` also stops there), `maxNameLength`, and `idValidatedEndpoints`.
- `utils.js` — shared pure helpers: `parseId`, `isIdInRange`, `isNonEmptyString`, `isValidEmail` (uses the `validator` package), `validateUserInput`. Reuse these instead of writing inline checks.
- `db/store.js` — in-memory data store (resets on restart). All routes must access data through its exported functions rather than touching the data directly; add new data operations there. Store functions validate their own inputs (e.g. `updateUser` throws a `TypeError` on a missing name or email).
- `tests/*.test.js` — integration tests against the exported `app`. Pre-written tests (e.g. `tests/update-user.test.js`) define the expected behavior; don't edit them to make them pass.
