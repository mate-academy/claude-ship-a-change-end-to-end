# NOTES

## Implementation plan
Approved plan: add `updateUser(id, { name, email })` to `db/store.js` (mirrors `getUserById`'s find-by-id, returns `undefined` if not found) and a `PUT /:id` handler in `routes/users.js` that validates `name`/`email` the same way `POST /` does (400 if missing), calls `store.updateUser`, and returns 404 if no user was found or 200 with the updated user otherwise. Implemented exactly as planned — no changes during execution.

## Model
Claude Sonnet 5. The task was a small, well-scoped endpoint addition with an existing pattern to mirror (GET /:id, POST /), so no reasoning-heavy exploration was needed — just careful adherence to the established conventions.

## Commit split
Two commits: (1) the endpoint implementation — `updateUser` in `db/store.js` plus the `PUT /:id` handler in `routes/users.js`, and (2) validation improvements from the review, isolated to `routes/users.js`. Keeping the review-driven fix separate makes it clear which change was the initial implementation and which was a follow-up correction.

## Review findings
Review flagged weak validation on `name`/`email` (any truthy value was accepted, including non-strings), whitespace-only values passing as valid, and no email format check — fixed by requiring both fields to be non-empty strings and validating email against a simple pattern.

Left unchanged, as none were required by the task: the precedence of validation (400) over the not-found check (404), the malformed-`:id` behavior (falls through to 404, matching `GET /:id`), and email uniqueness across users.
