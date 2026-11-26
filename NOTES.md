# Notes

## Plan
Add `PUT /users/:id` to update an existing user: 200 with the updated user on
success, 404 for an unknown id, 400 when `name` or `email` is missing. The
grading tests in `tests/update-user.test.js` define the contract, so the
route and store helper were built to satisfy them, mirroring the existing
`GET /users/:id` (404 handling) and `POST /users` (400 validation) patterns
already in `routes/users.js`.

## Model choice
Used **Claude Sonnet 5** for this task. The change is small, mechanical, and
follows patterns already established in the codebase (same validation shape
as `POST /users`, same not-found shape as `GET /users/:id`) — it doesn't need
heavier architectural reasoning, so a lighter/faster model than Opus is the
right fit. Sonnet is capable enough to get the validation-before-lookup
ordering and status codes right on the first pass while staying fast and
cheap for a task this size.

## Commit split
Implemented as a single logical change across two files, since they're one
feature:
- `db/store.js` — add `updateUser(id, { name, email })`, mirroring
  `getUserById`/`createUser`.
- `routes/users.js` — add the `PUT /:id` handler, mirroring the existing
  `GET /:id` and `POST /` handlers.

Kept as one commit rather than splitting store vs. route, since the route
handler is unusable without the store helper (no useful intermediate state).

## Review
Ran `npm test` after implementing. All three new tests in
`update-user.test.js` passed (200/404/400), plus the pre-existing
`users.test.js` suite stayed green, confirming no regression to the shared
in-memory store. Checked that validation happens before the id lookup, so a
missing field on an unknown id still returns 400 (matching `POST`'s
behavior) rather than leaking a 404 first.
