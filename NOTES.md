# Notes

## Plan
I planned in read-only plan mode before touching code, and approved it without edits. The plan: add `updateUser` to `db/store.js` (reusing `getUserById`, returning `undefined` when the user is missing); add `PUT /users/:id` to `routes/users.js` that validates the body first (400), then calls the store and maps a missing user to 404 (same `{ error: "User not found" }` shape as GET); add extra edge-case tests in a separate file so the provided `tests/update-user.test.js` stays untouched.

Validation rules: `name` and `email` are both required (PUT replaces the user), must be non-empty strings after trimming, and the email must match a simple `x@y.z` pattern. Values are trimmed before saving. I left POST's looser validation alone as out of scope.

## Model
I planned and wrote the store helper with Opus 5.5, then switched to Sonnet 5 for the route, tests, and PR. The feature is small and the tests define "done", so Sonnet was sufficient for the implementation; the heavier model was only worth it for the planning step.

## Commits
Three commits, one logical change each: (1) the store helper, (2) the route with validation and 404 handling, (3) the edge-case tests. This keeps the data-access layer separable from the HTTP layer, and each message stands on its own. NOTES.md is a fourth, docs-only commit.

## Review
I reviewed the diff and probed odd inputs by hand. It confirmed the not-found and validation paths behave as intended: empty, blank, non-string and invalid-email input all return 400 without modifying the stored user, and unknown or non-numeric ids return 404. It didn't require any code changes. One pre-existing gap: a malformed JSON body returns Express's default 400 error page (with a stack trace in the logs) rather than the `{ error }` shape. That applies to every route, including POST, so I left it as a possible follow-up.
