# NOTES

## Plan
Added an "update a user" endpoint, `PUT /users/:id`, to the users resource. The work was
two small changes that mirror the existing create flow:

- `db/store.js`: added an `updateUser(id, { name, email })` helper following the same shape as
  `getUserById`/`createUser`. It finds the user by id, returns `undefined` when absent (so the
  route can detect "not found"), otherwise updates the fields in place and returns the user.
- `routes/users.js`: added a `router.put("/:id", ...)` handler. It coerces the id with
  `Number()`, validates that `name` and `email` are present (returning a `400` with the same
  `{ error: "name and email are required" }` shape as the POST handler), calls the store, and
  returns `404` `{ error: "User not found" }` when the user doesn't exist. On success it
  returns `200` with the updated user.

No `server.js` change was needed — `express.json()` and the `/users` mount were already in
place. Validation deliberately matches the existing POST handler (presence check) rather than
introducing stricter rules, to keep the endpoints consistent.

## Model choice
Used Claude Opus 4.8 — planning + a small, convention-sensitive edit benefits from the stronger
model, and the change was small enough that speed wasn't a concern.

## Commit split
- Commit 1: the feature — `updateUser` store helper + the `PUT /users/:id` route handler.
- Commit 2: this `NOTES.md` write-up.

## What the review caught
- The grading test `tests/update-user.test.js` fixes the contract: `200` + updated user on
  success, `404` for a missing id, `400` for a missing field. The implementation targets it
  exactly.
- Confirmed the store is in-memory and resets on restart, so an in-place mutation in
  `updateUser` is sufficient and matches the existing pattern.
- Matched error shapes/messages and `Number()` id coercion to the existing handlers so the new
  endpoint is consistent with the rest of the resource.
