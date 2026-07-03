# Notes

## Plan

Added `PUT /users/:id` to update an existing user by id. Explored the existing
`routes/users.js` and `db/store.js` first to match the established pattern: thin
route handlers that validate input and delegate all data access to a store
helper, never touching the `users` array directly. The grading test file
`tests/update-user.test.js` already defined the exact contract (200 on success,
400 on missing fields, 404 on a nonexistent user), so the implementation was
built to satisfy that without modifying the test.

Added a new `updateUser(id, { name, email })` helper to `db/store.js` that
mirrors `getUserById`'s `undefined`-on-miss convention, and a `PUT /:id` route
in `routes/users.js` that validates the body (400, matching the existing
`{ error: "name and email are required" }` shape from POST) before checking
whether the user exists (404, matching the existing `{ error: "User not found" }`
shape from GET). Validating first is required by the test suite itself — the
"missing field" test targets an id that does exist and still expects 400 — and
is also the more defensible order generally (reject malformed input before
paying for a lookup).

## Model

Claude Sonnet 5, via Claude Code, in plan mode: explored the codebase with a
read-only agent, drafted the approach with a planning agent, then implemented
directly against the approved plan.

## Commit split

Single focused commit for the endpoint (store helper + route + this NOTES.md),
since the change is small and the pieces only make sense together.

## What review caught

Running `npm test` before writing this file caught nothing wrong with the
endpoint itself — all 5 relevant tests (3 new PUT tests + 2 pre-existing user
tests) passed on the first try, since the check ordering was designed against
the test contract up front rather than discovered by trial and error. The only
failure was the two `NOTES.md` tests, which fail until this file exists.