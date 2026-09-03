# NOTES

## Implementation plan

The task was to make `tests/update-user.test.js` pass by implementing `PUT
/users/:id`. I read the failing tests, the existing `routes/users.js`
handlers (`GET /`, `GET /:id`, `POST /`), and `db/store.js` to match the
project's existing conventions rather than inventing new ones:

- **`db/store.js`**: added `updateUser(id, { name, email })`, which reuses
  `getUserById` to find the user, returns `undefined` if no match is found
  (signalling "not found" to the route), and otherwise mutates the user's
  `name`/`email` in place and returns it.
- **`routes/users.js`**: added a `PUT /:id` handler that mirrors the
  validation style of `POST /` (400 if `name` or `email` is missing) and the
  404 style of `GET /:id` (404 if `store.updateUser` returns nothing), then
  responds `200` with the updated user JSON on success.

No changes were needed in `server.js` — `/users` was already mounted and
`express.json()` already parses the body.

## Model used

Implemented with Claude Sonnet 5 via Claude Code, working in plan mode: the
codebase was inspected first, a plan was written and approved, then the
approved plan was implemented.

## Commits made

Work is currently uncommitted in the working tree (by request, not yet
committed). The intended split is:

1. One commit implementing `PUT /users/:id` — `db/store.js` (`updateUser`)
   and `routes/users.js` (the new route handler).
2. A separate commit adding this `NOTES.md`.

## What was checked during review

- Ran `node --test tests/update-user.test.js` after implementing: all three
  cases pass (200 with updated fields, 404 for an unknown id, 400 for a
  missing field).
- Ran the full suite (`node --test tests/`) to check for regressions: the
  pre-existing `GET`/`POST` tests and the health check all still pass; the
  only failures are the `notes.test.js` checks for this file, now resolved.
- Confirmed `id` is preserved (not overwritten) on update, and that the
  update route reuses the same validation/error-shape conventions as the
  existing `POST /` and `GET /:id` handlers rather than introducing new
  patterns.
