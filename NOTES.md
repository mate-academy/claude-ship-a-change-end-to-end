# Notes

## Plan
Add `PUT /users/:id`: an `updateUser(id, data)` helper in `db/store.js` that returns `undefined` for an unknown id, and a route in `routes/users.js` that validates input (400), calls the store, and returns 404 or the updated user (200). I did not edit the plan beyond that: it already covered the store, the route, validation and the not-found path, and it followed the existing `getUserById`/`createUser` pattern.

## Model
Claude Sonnet 5.5. The change is small and well specified by the tests, so a fast, mid-sized model was enough; a larger model would add cost without adding value here.

## Commits
Two code commits, then the notes: (1) the store helper, (2) the route with validation and 404, (3) `NOTES.md`. Each commit is one logical change and can be understood on its own; the store change is independent of the HTTP layer.

## Review
I reviewed the diff for edge cases. Confirmed fine: unknown id returns 404 instead of crashing, a missing body is handled (`req.body || {}`), and the store does not mutate anything when the id is not found. Tightened during review: validation requires non-empty strings (so `{"name": 123}` or whitespace-only values return 400), and values are trimmed. Not covered: email format validation and duplicate emails, since neither the tests nor the existing POST route enforce them.
