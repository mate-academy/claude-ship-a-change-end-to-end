# Ship notes — update a user

## Plan
The approved plan was: add `updateUser` in `db/store.js` (return the user or `null`), then add `PUT /users/:id` in `routes/users.js` with the same validation as POST (name + email required → 400) and a 404 when the store returns null. I did not edit the plan before approving — the provided tests already spelled out the contract (200 update, 404 missing id, 400 missing field), and those two files are the only ones that needed changes.

## Model
I used Composer in Cursor. This change is small and pattern-matching against existing GET/POST routes and the in-memory store, so a fast coding model was enough; there was no need for a heavier reasoning model.

## Commits
I split the work into three commits:
1. Store helper first — data-access change on its own, easy to review in isolation.
2. Route next — HTTP validation and status codes wired to that helper.
3. NOTES.md last — written after a self-review so the notes reflect what actually shipped.

That order keeps each commit one logical layer and leaves a green endpoint before the write-up.

## Review
Self-review checked the not-found path (`null` → 404), validation order (reject bad bodies before looking up), and that `Number(req.params.id)` and error messages match GET/POST. Nothing needed fixing — the endpoint already followed the existing patterns, and `npm test` was green for the update-user cases before NOTES.md was added.
