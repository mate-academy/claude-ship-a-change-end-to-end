# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run dev      # node --watch server.js
npm start
npm test         # bare `node --test` — no jest/mocha
npm run lint     # eslint 8
```

Run a single test file: `node --test tests/users.test.js`
Run a single test by name: `node --test --test-name-pattern "returns 404"`

CI (`.github/workflows/ci.yml`, Node 22) runs `npm install`, `npm run lint`, `npm test` — lint
failures break the build, so lint before pushing.

## Architecture

Express API with three layers and no database:

- `server.js` — builds the app, `express.json()`, mounts each router at its prefix.
  `app.listen` is guarded by `require.main === module` so tests can `require("../server")`
  without binding a port. A new resource is only reachable once it's mounted here.
- `routes/<resource>.js` — one `express.Router` per resource, one handler per action. Paths
  inside a router are relative to its mount point (`/`, `/:id`).
- `db/store.js` — the in-memory store and the only data-access path. Routes call exported
  helpers (`getAllUsers`, `getUserById`, `createUser`); they never reach into the array.
  Adding a route that reads or writes data means adding a helper here first.

State lives in module-level variables and resets on restart — but **not** between tests in a
single `node --test` run, since the module is loaded once. Tests that create users must not
assume a fixed id or list length.

## Conventions

- CommonJS (`require`/`module.exports`) — `.eslintrc.json` sets `sourceType: "script"`.
- Route params are strings: coerce with `Number(req.params.id)` before hitting the store,
  which compares ids with `===`.
- Errors are `res.status(<code>).json({ error: "message" })` — 404 for a missing record,
  400 for invalid or missing input. Validate before calling the store.
- Handlers `return` the error response so execution stops.

## Course repo rules

This is a course project (see `README.md`). The current task is adding `PUT /users/:id`.

- `tests/update-user.test.js` and `tests/notes.test.js` are grading tests — **never edit
  them**. They start red; making them pass is the definition of done.
- A root `NOTES.md` is required and graded by `tests/notes.test.js` (must exist, ≥80 chars).
- Work on a branch and open a PR against the main course repo, not a fork.
