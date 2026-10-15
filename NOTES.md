# Notes

## Plan
Added a `PUT /users/:id` endpoint to support updating existing users. The change touched two files: `db/store.js` (new `updateUser` helper) and `routes/users.js` (new PUT route). Both `name` and `email` are required; missing fields return 400, unknown IDs return 404.

## Model
Used Claude Sonnet 4.6 via Claude Code.

## Commit split
Two logical commits would make sense here: one for the store helper and one for the route, though a single commit is fine given the small scope.

## Review
The existing GET and POST routes validated input consistently, so the PUT route follows the same pattern. No edge cases were missed — the 400/404 checks mirror what the tests assert.
