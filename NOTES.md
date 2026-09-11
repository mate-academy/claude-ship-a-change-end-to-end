# NOTES

## Plan

Before writing any code, I read the failing tests in `tests/update-user.test.js` and the
existing user-related code (`routes/users.js`, `db/store.js`, plus `tests/users.test.js` for
context on established conventions). The tests required implementing `PUT /users/:id` with
three behaviors: update an existing user and return 200, return 404 for an unknown id, and
return 400 when `name` or `email` is missing from the body.

The plan was to keep the new code consistent with what already existed rather than introduce
new patterns:

- Add an `updateUser(id, { name, email })` helper to `db/store.js` that mirrors the existing
  `getUserById`/`createUser` style — no HTTP concerns, just data access. It reuses
  `getUserById` for the lookup and returns `undefined` on a miss instead of throwing, mutating
  the found user in place otherwise.
- Add a `PUT /:id` handler to `routes/users.js` that validates `name`/`email` first (same
  falsy-check and 400 response as the existing `POST /` handler), then checks the store's
  return value for a 404 (same pattern as the existing `GET /:id` handler).

Validation was placed before the existence lookup: it's a cheap, stateless check that should
fail fast, and it matches the order `POST /` already uses (validate the shape of the request,
then touch the store).

## Model choice

This session used Claude Sonnet 5 (`claude-sonnet-5`), via Claude Code.

## Commit split

The changes are split into two commits:

1. **Implementation** — the `updateUser` store helper (`db/store.js`) and the `PUT /:id` route
   handler (`routes/users.js`) together, since they're one feature and neither is useful
   without the other.
2. **Docs** — this `NOTES.md` file.

## Review

I ran the project's `code-review` review process against the diff before committing. Result:
no correctness issues, edge-case regressions, or consistency problems found.

- `PUT /users/:id` follows the same validation style as `POST /` (falsy-check on `name`/
  `email`, 400 early return) and the same not-found pattern as `GET /:id` (falsy lookup result
  → 404).
- `store.updateUser` reuses `getUserById` and mutates the array element in place, consistent
  with how the rest of the in-memory store works.
- All three `update-user.test.js` cases pass, and no existing tests regressed.
- Pre-existing weaknesses (no email format validation, no type-checking on fields, `NaN` from
  a non-numeric `:id`) already exist in `GET`/`POST` and weren't introduced by this change, so
  they were left alone.
- One minor style note surfaced: the `if (!name || !email) return res.status(400)...` check is
  now duplicated across `POST` and `PUT`. Low severity given the file's small size — not
  extracted into a shared helper, but worth doing if the file grows more handlers with the same
  validation.
