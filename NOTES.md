# Notes: PUT /users/:id

## Plan
Approved as written, with no edits before approval. Add an `updateUser` helper to `db/store.js` that returns `undefined` for an unknown id, then add `PUT /users/:id` to `routes/users.js`. The route checks the body first (400), then looks up the user (404), then returns the updated user (200). PUT is a full replace, so both `name` and `email` are required. Blank or non-string values and an email without `@` are rejected with a specific message. Non-numeric ids become `NaN`, match nothing and return 404, the same as `GET /users/:id`.

## Model
`opusplan`: Opus for the read-only planning step, where the design choices (validation rules, check order) were made, and Sonnet for the implementation, which was small and well specified by the tests.

## Commits
Three commits, one logical change each: the store helper, the route with validation and 404, then this file. The store change stands alone and is reviewable without the route.

## Review
Ran `/code-review` at medium effort before pushing. One finding was real and is fixed: with a non-JSON Content-Type `req.body` is `undefined`, so destructuring it would have thrown a 500 instead of returning 400. The route now falls back to `{}`.

Findings I left alone on purpose:
- `Number(req.params.id)` accepts forms like `0x1` or `1.0`. This is existing behavior copied from `GET /users/:id`; fixing it belongs in a separate change covering both routes.
- Email validation is only an `@` check, and PUT is stricter than POST. Kept deliberately light; unifying the rules for POST and PUT is a follow-up.
- Validation runs before the lookup, so a bad body to an unknown id gets 400, not 404. Intentional, as described in the plan.
- `updateUser` mutates the stored object in place and there is no email-uniqueness check. Both are fine for this in-memory store and out of scope.
