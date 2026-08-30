# NOTES

## Plan I approved

Add a `PUT /users/:id` endpoint to the users resource, following the patterns already
in the repo. Two changes: a new `updateUser(id, { name, email })` helper in
`db/store.js` that returns the updated user or `undefined` when the id is unknown, and
a new route in `routes/users.js` that parses the id, validates the body, calls the
helper, and maps the result to `200` / `404`. Validation runs before the store lookup,
so a missing field returns `400` even for an existing id. I did not need to edit the
plan before approving it — it already covered the not-found and invalid-input cases
the tests check.

## Model choice

Claude Sonnet. The change is small and well-specified by the existing tests and code
conventions, so a fast, capable model was the right fit; no need for a heavier model
on a single-endpoint feature.

## Commit split

Three logical commits, each understandable without the diff:
1. `updateUser` helper in the store — the data layer, in isolation.
2. `PUT /users/:id` route with validation and 404 handling — the HTTP layer that uses
   the helper.
3. This `NOTES.md`.

Keeping the store and route changes apart makes each commit reviewable on its own and
mirrors the layering in the codebase.

## What review caught

Review confirmed the ordering of checks: validating the body before the store lookup
is what makes `PUT /users/1` with a missing field return `400` rather than falling
through. It also confirmed the endpoint follows the existing style — `Number(req.params.id)`,
the same `{ error: ... }` shape, and going through `db/store.js` for data access. No
bugs found; `npm test` and `npm run lint` are both green.
