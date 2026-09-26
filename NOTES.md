# Notes

## Plan

The approved plan was to add a `PUT /users/:id` route in `routes/users.js`
following the existing `GET /:id` (not-found) and `POST /` (validation)
patterns exactly, backed by a new `updateUser(id, { name, email })` helper
in `db/store.js` next to `getUserById`/`createUser`. Validation (400 on a
missing field) runs before the not-found check, and `NOTES.md` was
scheduled to be written last, after the review step, so it could reflect
what the review actually caught. No changes were made to the plan before
approving it — it matched the task exactly.

## Model

Claude Sonnet 5, the current default model in this Claude Code session —
appropriate for a small, well-scoped endpoint that follows an existing
pattern; no need for a heavier or more exploratory model here.

## Commits

Split into three logical commits:

1. `feat: add updateUser to store` — the data-layer change on its own.
2. `feat: add PUT /users/:id endpoint` — the route wiring, once the store
   supported it.
3. `fix: reject non-string fields and reuse getUserById in updateUser` —
   the fixes from the self-review, kept separate from the initial
   implementation so the diff shows what the review changed.

## Review

Ran a self-review of the diff before opening the PR. It flagged three
things:

- **Fixed** — validation only rejected missing fields, not invalid
  (wrong-type) ones, even though the spec asked for both. Added a
  `typeof` check for `name`/`email`.
- **Fixed** — `updateUser` re-implemented the same id lookup that
  `getUserById` already does. Changed it to call `getUserById` directly.
- **Not fixed** — flagged that `updateUser` doesn't enforce email
  uniqueness across users. Left as-is: the existing `POST /users`
  endpoint doesn't enforce that either, so adding it only to update would
  be inconsistent, unrequested scope creep.
