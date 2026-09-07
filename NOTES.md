## Plan

Add a `PUT /users/:id` endpoint to update an existing user, following the
conventions already established by `GET /users/:id` (404 handling) and
`POST /users` (input validation). Data access goes through `db/store.js`,
matching the existing `getUserById`/`createUser` pattern. The plan matched
the existing code closely enough that it was approved without changes.

## Model

Chose Sonnet for the task, because it is not so complex — a single new
route mirroring two existing handlers in the same file, with a red test
suite already defining the exact contract.

## Commits

Split the commits into two logical units:
1. `db/store.js` — add `updateUser(id, { name, email })`, returning
   `undefined` on a missing id (mirrors `getUserById`'s no-throw convention).
2. `routes/users.js` — add the `PUT /:id` route handler that validates the
   body (400) and handles not-found (404).

## Review

Reviewed the diff for bugs, edge cases, the not-found path, and validation.
Correctness holds: no crashes on non-numeric ids, no partial mutation before
validation fails, and the store mutates the same object referenced by
`GET /users/:id` so reads reflect the update immediately.

Two lower-severity observations, both left as-is since they mirror existing
conventions rather than being regressions:
- Validation runs before the existence check, so `PUT` on an unknown id with
  a missing field returns 400 instead of 404.
- Only presence is validated (`!name || !email`), not type or format — same
  gap as the existing `POST /users` validation, so fixing it here alone
  would be inconsistent with the rest of the resource.
