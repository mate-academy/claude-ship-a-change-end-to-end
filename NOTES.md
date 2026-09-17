# Notes — update-user endpoint

## Plan
Before writing any code I read `tests/update-user.test.js` to pin down the contract: `PUT /users/:id` must return 200 with the updated user on success, 404 for an unknown id, and 400 when a field is missing. The plan was to add the change in the same two places the existing `POST /users` route touches — a small `updateUser(id, data)` helper in `db/store.js` that mirrors `getUserById`/`createUser`, and a new `router.put("/:id", ...)` handler in `routes/users.js` that validates the body the same way `POST /users` already does, then delegates to the store. I didn't need to edit the plan — the existing code already had a clear pattern (validate in the route, look up/mutate in the store, 404 on a missing resource) so the smallest change was to keep following it rather than introduce a new one.

## Model
Used Claude Sonnet 5. The task is a small, well-specified CRUD addition to an existing codebase with an established pattern to copy — not a task that needed deep multi-file reasoning or a bigger model, so the faster/cheaper model was the right fit.

## Commits
Split into two commits, matching the two layers touched:
1. `db/store.js` — the `updateUser` helper (data access change).
2. `routes/users.js` — the `PUT /users/:id` route that uses it (HTTP-layer change).

Splitting by layer means each commit is independently reviewable and revertible — if the validation logic in the route ever needed to change, it wouldn't touch the store commit, and vice versa.

## Review
Self-reviewed the diff against the three cases the tests check plus a couple the tests don't:
- **Not-found path**: `Number(req.params.id)` on a non-numeric id produces `NaN`; `getUserById(NaN)` correctly finds nothing, so the route falls through to a clean 404 instead of throwing — confirmed this doesn't crash.
- **Validation order**: the route checks `name`/`email` before hitting the store, same as `POST /users`, so a bad request on an unknown id still reports 400 consistently rather than leaking which ids exist.
- **Mutation vs. replacement**: `updateUser` mutates the existing user object in place (`user.name = name; user.email = email;`) rather than replacing it, so the `id` is preserved and any other future fields on the record wouldn't be silently dropped.
No other issues found — `npm test` and `npm run lint` are both clean.
