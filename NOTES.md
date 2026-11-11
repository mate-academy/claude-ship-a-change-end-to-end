# NOTES

## Plan
Approved plan: add `updateUser(id, { name, email })` to `db/store.js` (returns `undefined` for an unknown id), then `PUT /users/:id` in `routes/users.js` that validates the id, `name` and `email` (400 with a clear message), returns 404 for a missing user, and 200 with the updated user otherwise. Validation runs before the lookup, so bad input is always a 400. The plan was approved as written; no edits.

## Model
Claude Sonnet 5.5. The change is small and well specified by the tests, so a fast, capable mid-tier model was enough; a larger model would add cost without adding value here.

## Commits
1. `feat(store): add updateUser helper` — the data-access layer on its own.
2. `feat(users): add PUT /users/:id with validation and 404` — the route that depends on it.
3. `docs: add NOTES.md` — the write-up.
One logical change per commit, so each can be read and reverted independently.

## Review
I exercised the endpoint with the provided tests plus extra edge cases: non-numeric id (`abc`), fractional id (`1.5`), blank name, email without `@`, non-string name, unknown id, and a missing body. All returned the expected 400/404. Known limitation: email validation is intentionally minimal (non-empty and contains `@`), and the store is in-memory, so there is no duplicate-email check.
