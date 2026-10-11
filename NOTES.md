# NOTES

## Plan
I approved a three-step plan: add `updateUser(id, { name, email })` to `db/store.js`
(returns `undefined` when the user doesn't exist), add `PUT /users/:id` to `routes/users.js`,
and write these notes. The route checks in this order: validation first (400), then lookup
(404). Validation is stricter than in POST: `name` and `email` must be non-empty strings.
I didn't edit the plan before approving it.

## Model
I chose Opus: it is more reliable on changes where edge cases matter (400/404 ordering,
invalid types in the request body). The task is small, but a mistake in validation logic
costs more than the speed difference saves.

## Commits
Three logical commits: (1) the store helper, (2) the route with validation and 404,
(3) `NOTES.md`. The store and the route are separate so each commit has a single reason to
exist and can be understood or reverted on its own. The update-user tests are green after
commit 2.

## Review
The review confirmed the main paths are fine: a non-numeric id becomes `NaN` and returns 404,
and malformed JSON is handled by Express (400). It also caught two real issues, which I
fixed: the handler relied on Express 4 defaulting `req.body` to `{}` (now `req.body ?? {}`,
so it stays a 400 on Express 5), and values were validated trimmed but saved untrimmed (now
saved trimmed). I added `tests/update-user-edge.test.js` to cover empty body, wrong types,
blank values, non-numeric id and trimming. Findings I deliberately left alone: ids like
`1.0` or `0x1` resolve to user 1 (same as the existing GET route), POST validation is looser
than PUT (out of scope), email format and uniqueness are not checked, and `updateUser`
mutates the shared in-memory object (same as the rest of the store's pattern).
