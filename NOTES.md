# Notes: PUT /users/:id

## Plan
Approved as written, with no edits before approval. Add an `updateUser` helper to `db/store.js` that returns `undefined` for an unknown id, then add `PUT /users/:id` to `routes/users.js`. The route checks the body first (400), then looks up the user (404), then returns the updated user (200). PUT is a full replace, so both `name` and `email` are required. Blank or non-string values and an email without `@` are rejected with a specific message. Non-numeric ids become `NaN`, match nothing and return 404, the same as `GET /users/:id`.

## Model
`opusplan`: Opus for the read-only planning step, where the design choices (validation rules, check order) were made, and Sonnet for the implementation, which was small and well specified by the tests.

## Commits
Three commits, one logical change each: the store helper, the route with validation and 404, then this file. The store change stands alone and is reviewable without the route.

## Review
Not yet done. To be filled in after the pre-push review.
