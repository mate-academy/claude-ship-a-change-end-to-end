# NOTES

## Plan

The approved plan was to add a `PUT /users/:id` endpoint following the style
already established by `GET /users/:id` (404 lookup) and `POST /users` (400
validation) in `routes/users.js`: validate that `name` and `email` are both
present in the body (400 if not), look up the user via a new
`store.updateUser(id, { name, email })` helper (404 if it doesn't exist),
mutate and return the user on success. I didn't edit the plan before
approving it — it matched the existing route conventions and the grading
tests in `tests/update-user.test.js` directly, so there was nothing to
change.

## Model choice

Claude Sonnet 5. The task was small and pattern-matched against code already
in the file (two nearly-identical routes to mirror), so it didn't call for
extra reasoning depth — Sonnet was the right cost/quality tradeoff for a
scoped, well-specified change like this.

## Commit split

Two commits: one for the working endpoint (`routes/users.js` +
`db/store.js`, the actual feature), and a separate one for this `NOTES.md`.
Keeping the write-up out of the feature commit means the diff for the
endpoint is just the endpoint — easy to review on its own — while the notes
commit is purely documentation.

## Review

Self-review before pushing confirmed: the 400 check runs before the 404
lookup (so a request with a missing field short-circuits regardless of
whether the id exists, consistent with `POST /users`), the not-found path
returns a JSON error body instead of crashing, and no files outside
`routes/users.js`, `db/store.js`, and `NOTES.md` changed. Nothing needed
fixing — the mirrored pattern from the existing routes held up.
