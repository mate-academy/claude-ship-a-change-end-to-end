# Notes: PUT /users/:id

**Plan.** Add `updateUser(id, { name, email })` to `db/store.js` (returns `undefined` when the id is unknown), then a `PUT /users/:id` route in `routes/users.js` that validates input, calls the store, and maps `undefined` to 404. PUT is a full replace (both fields required), matching the tests and the POST validation; no edits to the plan were needed.

**Model.** Claude Opus — the change is small, but it was done end to end (plan, code, review, PR) in one pass, and the stronger model makes fewer slips on edge cases.

**Commits.** Three: the store helper, the route, then this NOTES.md. Each is a self-contained step that reads on its own; the data layer lands before the route that uses it.

**Review.** Checked: the not-found path returns 404 instead of crashing; validation runs before the lookup, so a bad body is 400 even for an unknown id; non-string or whitespace-only fields are rejected (stricter than POST's truthiness check) and values are trimmed. A non-numeric id becomes `NaN` and correctly 404s. Not addressed: email format and uniqueness checks — out of scope and not done for POST either.
