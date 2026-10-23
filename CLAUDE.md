# CLAUDE.md


## Project

A small Express API used as a teaching repo for a Claude Code course. 

## Commands

- `npm install` — install dependencies
- `npm run dev` — run the server with `node --watch` (auto-restart) on `PORT` (default 3000)
- `npm start` — run the server once
- `npm test` — run all tests (`node --test`, Node's built-in test runner)
- `npm run lint` — run ESLint over the whole repo



## Architecture

- `server.js` creates the Express `app`, mounts `routes/users.js` at `/users` and `routes/health.js` at `/health`, and only calls `app.listen` when the file is run directly (`require.main === module`). This lets tests `require("../server")` and drive it with `supertest` against an in-memory app instance, never a real open port.
- `routes/*.js` — one router module per resource, one route handler per action. Handlers do input validation and HTTP status mapping; they never touch data directly.
- `db/store.js` — the single in-memory data layer. All data access from routes goes through exported helper functions here (e.g. `getAllUsers`, `getUserById`, `createUser`). Data lives in a module-level array and resets on every server restart — there is no real database. When adding a new data operation, add the helper here rather than mutating the array from a route.
- `tests/` — uses Node's built-in `node:test` + `node:assert` with `supertest` for HTTP assertions, importing the exported `app` directly (no network calls). Grading tests (e.g. `tests/update-user.test.js`) are provided already-written and marked not to be edited — treat any test file with such a header comment as read-only; implement against it until it passes.


## Workflow convention for this repo

Course projects in this repo follow a plan → build in logical commits → self-review → PR pattern, and expect a `NOTES.md` at the project root (plan summary, model choice, commit split, review findings) as part of the deliverable. When a task looks like a course project (it adds a scoped endpoint/feature with pre-written tests), follow that workflow rather than just making the tests pass.
