# NOTES

## Plan
The plan (built by reading `routes/users.js`, `db/store.js`, and the pre-written
`tests/update-user.test.js`) was to add a `PUT /users/:id` route that mirrors the
existing `GET /:id` / `POST /` patterns exactly: validate `name`/`email` the same
way `POST /` does, add an `updateUser(id, { name, email })` helper to `db/store.js`
that returns `undefined` for an unknown id (mirroring `getUserById`), and 404 the
route when that helper returns nothing. I approved the plan as designed, with one
adjustment after the plan was written: work on a dedicated feature branch, make
local commits only, and write this NOTES.md after running a self-review rather
than before, so it reflects what the review actually found.

## Model choice
Claude Sonnet 5. The task was small and fully specified by the existing tests and
two sibling route handlers to mirror — no architectural ambiguity that would call
for a heavier-reasoning model, and no exploratory research needed.

## Commit split
Two feature commits, kept separate because they're different layers of the stack:
1. `db/store.js` — add the `updateUser` helper (data layer).
2. `routes/users.js` — add the `PUT /:id` route that uses it (HTTP layer).

This NOTES.md lands as a third commit, after the self-review, so it can describe
real findings instead of a prediction of what the review would say.

## Review
I ran `/code-review` (medium effort) against the diff. It found the implementation
correct and consistent with the existing GET/POST conventions (same `Number(id)` →
NaN → not-found fallthrough, same falsy-check validation style) — no correctness
bugs, no dropped invariants. Its one flag: the `if (!name || !email)` validation
block in the new `PUT` handler is copy-pasted verbatim from `POST /`, so a future
change to the required-fields rule would need to be made in two places. I left it
as-is rather than extracting a shared helper — it's three duplicated lines that
match the file's existing un-abstracted style (`POST` doesn't share this logic
with anything else either), so a helper felt like premature abstraction for the
current size of the file.

`npm test` and `npm run lint` are both clean on this branch.
