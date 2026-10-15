# Notes: PUT /users/:id

## Plan

The goal was to implement `PUT /users/:id` so it updates an existing user,
validates required fields, returns 400 for invalid input, returns 404 when
the user doesn't exist, and goes through `db/store.js` for data access —
without touching `tests/update-user.test.js`, which defines the contract.

Before writing any code, I read the existing patterns already in the repo:

- `db/store.js` exposes `getUserById` and `createUser` as simple, direct
  functions over an in-memory `users` array.
- `routes/users.js` follows a consistent shape per route: parse/validate
  input first, return 400/404 as needed, otherwise delegate to the store
  and respond with JSON.

Rather than invent a new pattern, `PUT /:id` reuses both:

1. **`db/store.js`** — added `updateUser(id, { name, email })`. It looks the
   user up with the existing `getUserById`, returns `undefined` if not
   found (same not-found signal `getUserById` already uses), otherwise
   mutates the found user's `name`/`email` in place and returns it.
2. **`routes/users.js`** — added a `PUT /:id` handler that validates
   `name`/`email` are present (400 if not, matching `POST /`'s validation
   message), calls `store.updateUser`, and returns 404 if no user came
   back, otherwise 200 with the updated user.

Validation happens before the store lookup, so a request with a missing
field returns 400 even for a nonexistent id — this matches how the grading
tests are written (`PUT /users/1` with a missing field expects 400, not a
404 check first).

## Model choice

Implemented with Claude Sonnet 5 in Claude Code, using plan mode: explored
the existing store/route/test files first, wrote a plan, then implemented
only the two files the plan called for (`db/store.js`, `routes/users.js`).
`tests/update-user.test.js` was read but never edited.

## Commit split

The change is small and touches two files that each have one responsibility,
so it splits into two commits:

1. `db/store.js` — add the `updateUser` data-access helper.
2. `routes/users.js` — add the `PUT /:id` route that uses it.

Keeping the store change separate from the route change makes it easy to
see that the new HTTP behavior is backed by a corresponding, minimal
data-layer addition rather than logic embedded directly in the route.

## Review notes

Ran `npm test` after implementing:

- All 3 tests in `tests/update-user.test.js` pass (200 on update, 404 for a
  nonexistent id, 400 for a missing field).
- No regressions in the existing `tests/users.test.js` or `tests/health`
  coverage — 7 of 9 total tests passing.
- The only failures are in `tests/notes.test.js`, which checks for this
  file (`NOTES.md`) — expected before this file existed, resolved by this
  write-up.
