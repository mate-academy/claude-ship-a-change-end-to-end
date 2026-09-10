# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                              # install deps
npm run dev                              # node --watch server.js (localhost:3000)
npm start                                # run without watch
npm test                                 # node --test — discovers tests/*.test.js
node --test tests/update-user.test.js    # run a single test file
node --test --test-name-pattern "404"    # run tests matching a name
npm run lint                             # eslint .
```

CI (`.github/workflows/ci.yml`) runs `npm install`, `npm run lint`, then `npm test` on Node 22 for every push and PR. Lint failures break the build, so run both locally before pushing.

## Architecture

A deliberately small Express API used as the course's practice repo.

- `server.js` — builds the `app`, mounts `express.json()` and the routers, and exports `app`. It only calls `app.listen()` when run directly (`require.main === module`), so tests can `require("../server")` and drive it with supertest without binding a port. Preserve that guard.
- `routes/*.js` — one `express.Router()` per resource, mounted at its prefix in `server.js` (`/users`, `/health`). Route paths inside a router are relative (`router.get("/:id")`, not `/users/:id`).
- `db/store.js` — the only data access layer: a module-level array plus a `nextId` counter, exporting named helper functions. Routes never touch the array directly; add a helper here and call it from the route. State is per-process and resets on restart.

Conventions the existing code follows: CommonJS (`require`/`module.exports`, ESLint is configured for `sourceType: "script"` — ESM will fail lint), `Number(req.params.id)` before a store lookup since ids are numeric, `404 {"error": "..."}` for a missing record, `400 {"error": "..."}` for missing required fields, and `201` on create.

## Testing

`node:test` + `node:assert` + supertest against the exported `app`. Each test file runs in its own process, so the in-memory store starts fresh per file — but tests *within* a file share mutations, which is why `update-user.test.js` POSTs a user before updating it rather than assuming a fixed id.

`tests/update-user.test.js` and `tests/notes.test.js` are grading tests. Do not edit them; make them pass. `notes.test.js` requires a `NOTES.md` at the repo root with at least 80 characters of real content.

## Project task

See `README.md` for the full assignment. The deliverable is `PUT /users/:id` (update, 400 on a missing field, 404 on an unknown id) implemented through a new `db/store.js` helper, plus a `NOTES.md` write-up, shipped as a PR from a branch.
