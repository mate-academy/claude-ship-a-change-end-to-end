# Notes: PUT /users/:id

## Plan

The task was to add an "update a user" endpoint: `PUT /users/:id`, validating
input, returning 404 for an unknown user, and going through `db/store.js`
like the existing routes. The plan was to add a small `updateUser(id, {name,
email})` helper to the store (mirroring the existing `getUserById` /
`createUser` helpers), then add the `PUT /:id` route in `routes/users.js`,
validating `name`/`email` the same way `POST /users` already does before
checking whether the user exists. I didn't need to change the plan — the
existing GET/POST routes already established a clear pattern to follow, so
the shape of the change was obvious from reading the codebase first.

## Model

Used the session's default model (Claude Opus 5). This is a small,
well-specified change against an existing, very consistent pattern in a
tiny codebase, so a lighter/faster model would likely have worked just as
well — I didn't need extra reasoning depth here, just careful pattern
matching against the existing GET/POST routes and the provided tests.

## Commit split

Two commits, one per layer, matching how the codebase already separates
data access from routing:

1. `db/store.js` — add the `updateUser` helper (data layer).
2. `routes/users.js` — add the `PUT /:id` route that uses it (HTTP layer).

Keeping them separate makes each commit reviewable on its own: the first
is pure data-layer logic ("how do we update a user"), the second is pure
request handling ("how do we expose that over HTTP").

## Review

Self-reviewed by running `npm test` and `npm run lint` after implementing:
- All three `update-user.test.js` cases pass (200 update, 404 for unknown
  id, 400 for a missing field), and the pre-existing tests (health, users
  list/404) still pass — no regressions.
- Checked the validation-vs-not-found ordering: the endpoint validates
  input first (matching `POST /users`), then looks the user up. The given
  tests don't exercise "invalid body + unknown id" together, but validating
  first keeps the behavior consistent with the existing POST route rather
  than introducing a different rule just for this endpoint.
- Confirmed `updateUser` mutates the existing user object in place (via
  `getUserById`) rather than replacing it in the array, consistent with how
  the in-memory store already works elsewhere in `db/store.js`.
- Lint is clean (`npm run lint`), so no style issues were introduced.
