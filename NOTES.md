# Notes: update-user endpoint

## The plan

Before writing code, I read `tests/update-user.test.js` to pin down the exact
contract: `PUT /users/:id` must return 200 with the updated user on success,
404 when the id doesn't exist, and 400 when `name` or `email` is missing. The
plan was to touch exactly two files, mirroring the existing routes:

- `db/store.js` — add an `updateUser(id, { name, email })` helper that looks
  up the user with the existing `getUserById`, returns `undefined` if it's
  missing, and otherwise mutates and returns the record.
- `routes/users.js` — add a `PUT /:id` handler that validates the body the
  same way `POST /` does, calls `store.updateUser`, and maps a missing user
  to a 404 (matching the existing `GET /:id` 404 response) or a found user to
  a 200.

No changes to the plan were needed once I looked at the existing route/store
patterns — the POST and GET handlers already established the exact
conventions (validation shape, 404 error shape) to reuse, so there was
nothing to redesign.

## Model choice

Used Claude (Sonnet 5) for the whole task. The change is small and pattern-
following (extend an existing CRUD resource), which doesn't need a heavier
model — the main risk was fidelity to the existing conventions, not
algorithmic complexity, so a fast, capable model was the right fit.

## Commit split

Split into three logical commits instead of one:

1. `db/store.js`: add the `updateUser` data-access helper.
2. `routes/users.js`: add the `PUT /:id` route that uses it.
3. `NOTES.md`: the write-up.

Data layer before route layer means each commit is independently reviewable
(the store change is a pure data-shape addition; the route change is where
the HTTP behavior — status codes, validation — actually lives), and it
mirrors how the existing GET/POST endpoints are already layered across the
same two files.

## What review caught

Self-review before opening the PR focused on the two edge cases the tests
don't directly name:

- **Non-numeric `:id`** (e.g. `PUT /users/abc`): `Number("abc")` is `NaN`,
  and `Array.prototype.find` never matches `NaN` via `===`, so this falls
  through to the existing 404 path rather than crashing — confirmed this is
  consistent with how `GET /:id` already handles it.
- **Validation order**: checking `name`/`email` before looking the user up
  means a request with a missing field and a non-existent id returns 400,
  not 404. This matches the existing `POST /` behavior (validate first) and
  is what the test suite expects, so no change was needed there.

Nothing else was flagged — the implementation reuses the existing store and
error-shape conventions directly, so there wasn't new logic to second-guess.
