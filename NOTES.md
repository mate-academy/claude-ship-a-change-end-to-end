# Notes

## Plan

I planned to add a `PUT /users/:id` endpoint: a new `updateUser(id, { name, email })`
helper in `db/store.js` that reuses the existing `getUserById` lookup and
returns `undefined` when the user is missing (mirroring `getUserById`'s own
contract), plus a route in `routes/users.js` that validates `name`/`email`
are present (400), calls the store helper, and returns 404 if it comes back
`undefined` or 200 with the updated user otherwise. I approved the plan as
written — no changes were needed before starting.

## Model

Claude Sonnet 5. The task was fully specified by the README and the
pre-written grading tests, so it didn't need heavier reasoning — a fast,
straightforward model was the right fit for implementing a small, well-scoped
endpoint against an existing pattern.

## Commits

Two commits: the store helper and the route landed together, since
`updateUser` exists only to serve this one route — splitting them would leave
an intermediate commit with a helper nothing calls yet. `NOTES.md` is a
separate second commit, written after the code was built, tested, and
reviewed, so it reflects what actually happened rather than what was planned.

## Review

Self-reviewed the diff before writing this file. Checked the non-numeric id
case (`Number("abc")` is `NaN`, and `NaN !== NaN` means the lookup correctly
falls through to a 404) — this matches the existing `GET /:id` behavior, not
a new edge case introduced here. Also confirmed the 400-vs-404 check order
(validate first, then look up) satisfies both grading tests regardless of
which came first, and kept it consistent with `POST /users`'s existing
validate-first style. No bugs found; no changes needed.
