# Notes on the update-user endpoint

## The plan

Add `PUT /users/:id` to `routes/users.js`, backed by a new `updateUser(id, { name, email })`
helper in `db/store.js` (mirroring the existing `getUserById`/`createUser` pair so the route
stays a thin wrapper around the store). The route needed to: validate that `name` and `email`
are both present and return 400 otherwise, return 404 when the id doesn't match a user instead
of throwing, and return the updated user with 200 on success. No changes were needed to
`tests/update-user.test.js` — the tests were already there and defined the contract. I didn't
have to edit the plan before approving it; the shape of the change (one store helper, one route,
validate-then-lookup) matched the existing `POST /users` pattern closely enough that there was
no ambiguity to resolve.

## Model choice

Used the current session's model (Claude Sonnet 5). The task is small and well-scoped — one
route, one store function, a fixed test contract to satisfy — so a fast, capable model is enough;
there's no need for a slower, more expensive model on a change this contained.

## Commit split

Two commits, in dependency order:
1. `db/store.js` — add the `updateUser` helper on its own, since it's the data-layer change the
   route depends on and is independently reviewable.
2. `routes/users.js` — add the `PUT /users/:id` route that uses it.

Splitting this way means each commit does one thing and reads cleanly on its own — the store
change makes sense without the route, and the route commit's diff is just the new endpoint.

## What review caught

Self-review before opening the PR checked:
- **Validation order**: input is validated (400) before the id lookup happens, so a request with
  a missing field gets 400 even for a nonexistent id — didn't matter for the given tests but is
  the more correct REST behavior.
- **Non-numeric ids**: `Number(req.params.id)` on a non-numeric id produces `NaN`, which never
  matches a stored id, so it falls through to 404 rather than crashing. This matches the existing
  `GET /users/:id` route's behavior, so it's consistent rather than a new edge case to handle.
- **Mutation approach**: `updateUser` mutates the stored user object in place and returns the
  same reference, consistent with how `createUser` already works in this file — no new
  immutability guarantee was introduced or broken.

Nothing needed fixing after this pass; `npm test` and `npm run lint` were both clean.
