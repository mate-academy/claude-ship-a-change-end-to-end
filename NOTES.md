# Notes

## Plan
The approved plan was to add a `PUT /users/:id` route in `routes/users.js` plus a matching `updateUser(id, { name, email })` helper in `db/store.js`, following the exact validation and error-response style already used by `GET /:id` and `POST /`: truthiness-check `name`/`email` for a 400, look up the user for a 404, otherwise update and return it with an implicit 200. Before approving, I clarified one open question — whether validation should go beyond a truthiness check (e.g. type/format checks on email) — and decided to match the existing `POST /users` validation exactly rather than add new validation logic that isn't exercised by the tests or present elsewhere in the codebase. No other edits were made to the plan.

## Model choice
Used Claude Sonnet 5 for planning and implementation. The task was small and well-scoped (one route, one store helper, following an established pattern), so a fast, capable model was enough — no need for deeper reasoning modes.

## Commit split
Split into two commits: one for the `updateUser` store helper (`db/store.js`), and one for the `PUT /users/:id` route itself (`routes/users.js`). Each commit is a complete, independently understandable unit — the store change adds a data-access capability, the route change wires it up to HTTP — which keeps the diff easy to review and revert independently if needed.

## Review
Ran a full-effort code review (correctness, reuse/simplification/efficiency, altitude, conventions) over the diff. It confirmed the change was safe: `express.json()` always sets `req.body` to `{}` (never `undefined`) so the destructuring can't throw, the validate-before-lookup ordering and NaN-id handling behave correctly, and no other code in the repo depends on `db/store.js`'s exports in a way this change could break. No issues were found or needed fixing.
