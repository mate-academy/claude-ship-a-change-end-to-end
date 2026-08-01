# NOTES

## Plan

The plan was small and scoped to two files: add an `updateUser(id, { name, email })`
helper to `db/store.js` that looks the user up, mutates it in place, and returns
`undefined` if the id doesn't exist; then add a `PUT /users/:id` route in
`routes/users.js` that validates `name`/`email` are present (400), calls the store
helper, and returns 404 if it comes back empty or 200 with the updated user
otherwise. This mirrors the existing `POST /users` validation and the existing
`GET /users/:id` not-found handling, so no new patterns were introduced. I didn't
need to edit the plan before approving it — it already covered the route, the store
helper, and both the not-found and invalid-input cases the tests require.

## Model

Used Sonnet 5 (the harness default here). This is a small, well-specified CRUD
endpoint with tests already written to define the contract, so it didn't need a
heavier model — the main risk was missing an edge case, which the review step
below covers.

## Commit split

Two commits: one for the store helper (`Add updateUser store helper`), one for the
route (`Add PUT /users/:id endpoint`). Splitting data-layer from route-layer keeps
each commit reviewable on its own and matches how the rest of the store/route
functions are already organized in this repo (each store function has a matching
route handler).

## Review

Reviewed the diff myself and had a second pass done independently. Both passes
agreed on two minor, non-blocking observations: (1) validation runs before the
existence check, so an invalid body against a nonexistent id returns 400 rather
than 404 — not covered by the tests, and it mirrors how `POST /users` already
validates first; (2) `name`/`email` are only checked for truthiness, not trimmed
or type-checked, so whitespace-only strings would pass — this is inherited from
the existing `POST /users` validation, not a regression introduced here. Neither
review found any bugs in the not-found path, the id coercion, or the store
mutation logic, so I left the code as written rather than diverging from the
existing POST convention.
