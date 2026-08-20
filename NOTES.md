# Notes

## Plan
Add a `PUT /users/:id` endpoint to update an existing user. Explored the
existing users resource and `db/store.js` first to match established
conventions: inline validation (no schema library), `store.js` returning a
falsy value for "not found" and letting the route layer decide the HTTP
status. The pre-written tests in `tests/update-user.test.js` defined the
target behavior: 200 + updated user on success, 400 for a missing required
field, 404 for an unknown id.

## Model choice
Claude Sonnet 5. The task was a small, well-scoped feature addition that
closely followed an existing pattern (GET/POST routes and store functions
already in the repo), which Sonnet handles well without needing a larger
model's extra reasoning overhead.

## Commit split
Two commits, each run through the test suite and manually approved before
committing:
1. `Add updateUser store helper` — added `updateUser(id, { name, email })`
   to `db/store.js`, mirroring `getUserById`/`createUser`.
2. `Add PUT /users/:id endpoint` — wired the route in `routes/users.js`,
   reusing the same validation and 404 shape as the existing routes.

Splitting store logic from the route kept each commit reviewable on its own
and let the test suite confirm no regressions after the first commit, before
the endpoint itself existed.

## Review
No bugs were found in review — the implementation directly mirrors the
existing `GET /users/:id` (404 handling) and `POST /users` (validation)
patterns, so there was little room for divergence. `npm test` was run after
each commit; all tests in `tests/update-user.test.js` and the pre-existing
`tests/users.test.js` pass with no regressions.
