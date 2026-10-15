# Notes

## Plan

Entered plan mode before touching any code. The plan was: add an `updateUser(id, { name, email })` helper to `db/store.js` that mutates the matching user in place and returns `null` if no user matches, then add a `PUT /:id` route in `routes/users.js` that mirrors the existing `GET /:id` (id parsing, 404 pattern) and `POST /` (validation, 400 pattern) — validating `name`/`email` first, then checking for a not-found user. I approved the plan as written; the only thing I added on top of it was the self-review pass and this NOTES.md, both already called out as follow-up steps in the plan rather than changes to it.

## Model

Used Claude to plan and implement. Sticking with the default model was the right call here — this is a small, well-specified change against an existing pattern (mirror `GET /:id` and `POST /`), not something needing deep reasoning or a bigger context window.

## Commits

Split into two commits: one for the feature (`feat: add PUT /users/:id endpoint`, covering both the store helper and the route together, since they're one cohesive and only independently-meaningless-without-each-other change), and one for this `NOTES.md` (`docs: add NOTES.md`), written last so it reflects what actually happened during the review step rather than the plan's predictions.

## Review

Self-reviewed the diff against the not-found and invalid-input paths before writing this up: confirmed validation runs before the existence check (matching the test that expects 400 for a missing field on an id that does exist), confirmed empty-string fields are rejected the same as missing ones (`!name`/`!email`), and confirmed a non-numeric or unknown id falls through to 404 the same way the existing `GET /:id` route does. No bugs found — the implementation matched the plan and existing conventions closely enough that the review didn't surface changes, just confirmed the edge cases already worked.
