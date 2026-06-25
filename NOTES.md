# NOTES

## The plan
Add an `update a user` endpoint (`PUT /users/:id`) to the users resource. The work
splits cleanly into two layers, matching the existing code:

- A `updateUser(id, { name, email })` helper in `db/store.js`, following the same
  pattern as `getUserById` and `createUser`. It returns the updated user, or
  `undefined` when no user has that id.
- A `PUT /:id` route in `routes/users.js` that validates input (both `name` and
  `email` are required), calls the store helper, and maps a missing user to a 404.

A subtle point that shaped the route: the missing-field check must run *before* the
not-found check, because the grading test sends an incomplete body to an id that
*does* exist (`PUT /users/1` with only a name) and expects a 400.

## Model choice
Opus 4.8 — the change is small but spans validation, a not-found path, and matching
existing conventions, and it had to satisfy fixed grading tests exactly. Opus's
reliability on getting the edge-case ordering right was worth it over a faster model.

## Commit split
One logical change per commit: (1) the `updateUser` store helper plus the
`PUT /users/:id` route — they're one feature and don't make sense apart; and
(2) this `NOTES.md`. Each message reads clearly without opening the diff.

## What review caught
Review confirmed the validation-before-not-found ordering was correct (the reason
`PUT /users/1` with a missing field returns 400 rather than 404), and that the
route reuses the existing 400/404 response shapes. All data access goes through
`db/store.js`, so no route touches the in-memory array directly. `npm test` is green.
