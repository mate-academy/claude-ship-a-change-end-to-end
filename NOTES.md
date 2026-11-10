# Notes: PUT /users/:id

## Plan
Add an update endpoint to the users resource. I explored the repo first (Express app, in-memory `db/store.js`, existing routes and tests), then planned the change before editing: a `updateUser` helper in the store, and a `PUT /:id` route that validates input, returns 404 for unknown ids, and goes through the store like the other routes. `tests/update-user.test.js` was the definition of done and was not edited.

## Model choice
Sonnet 5.5. The change is small and follows an existing pattern, so a fast, capable model was enough. <!-- Edit if you chose differently. -->

## Commit split
<!-- Fill in once you've committed. Suggested split: -->
1. `db/store.js`: add `updateUser` and export it.
2. `routes/users.js`: add `PUT /users/:id` with validation and 404 handling.
3. `NOTES.md`: this file.

## What review caught
<!-- Fill in after running a review (e.g. /code-review). Things worth checking: -->
- Validation runs before the existence check, so bad input on a missing id returns 400, not 404.
- Name and email are trimmed before saving, and email must look like `x@y.z`.
- `POST /users` still uses the looser `!name || !email` check, so the two endpoints validate differently. Left as is to keep this change scoped.

## Test results
`npm test` on 2026-11-11: 9 tests, 9 passed, 0 failed.

- PUT /users/:id updates an existing user: pass
- PUT /users/:id returns 404 for a user that does not exist: pass
- PUT /users/:id with a missing field returns 400: pass
- GET /health returns ok: pass
- GET /users returns a list of users: pass
- GET /users/:id returns 404 for a user that does not exist: pass
- POST /users with no body returns 400: pass
