# Notes

## Plan
Add `PUT /users/:id`. The store gets an `updateUser` helper (data access stays in `db/store.js`), and the route in `routes/users.js` follows the existing GET/POST handlers. An unknown id returns 404 "User not found". A missing or empty `name` or `email` returns 400 "name and email are required".

## Model
Claude Sonnet 5.5 (`claude-sonnet-5-5`) in Claude Code. The change was small and the patterns were already in the codebase.

## Commit split
1. Store helper and route for the update endpoint.
2. This `NOTES.md`.

## Review
I smoke-tested the edge cases against the running app. No crashes were found.

What held up:
- An unknown or non-numeric id returns 404, including when the body is also invalid.
- A missing body, a missing field, a whitespace-only value and a non-string `name` all return 400 rather than crashing on `.trim()`.
- Extra body fields such as `id` are ignored, so a client can't change a user's id.

What the review caught, left as is:
- Email format isn't validated (`"nope"` is accepted). The brief asked for 400 on a missing field, and POST doesn't check format either.
- The 400 message says "required" even when the field is present with the wrong type.
- The route looks the user up twice (route, then `updateUser`). This is harmless for an in-memory store.
- `/users/1e0` resolves to user 1 because of `Number()`. GET behaves the same way.
- Malformed JSON gets Express's default error response. This predates the change and affects POST too.
- Only the supplied tests cover PUT. The whitespace, wrong-type and extra-field cases have no tests.
