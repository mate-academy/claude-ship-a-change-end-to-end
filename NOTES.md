# Notes: Add PUT /users/:id

## Plan

I planned to add an `updateUser(id, { name, email })` helper to `db/store.js` that looks the
user up, returns `null` if it isn't found, and otherwise mutates and returns it — following the
same shape as the existing `getUserById`/`createUser` helpers. On top of that, `routes/users.js`
gets a `PUT /:id` route that validates `name`/`email` are present (400 if not, matching the
existing `POST /` check), calls the new helper, and returns 404 if the helper returns `null` or
200 with the updated user otherwise. I approved the plan as written — the pre-supplied test file
fully specified the contract (200/404/400 paths), and the existing routes already established the
exact validation and error-response style to follow, so there was nothing to adjust before
approving.

## Model

I used Claude Sonnet 5. The task was small and had an unambiguous contract (a single pre-written
test file plus two existing files to pattern-match against), so a fast, capable model was enough —
there was no need for deeper multi-step reasoning that would call for a heavier model.

## Commits

I split the work into two commits: one adding `updateUser` to `db/store.js`, and a second adding
the `PUT /:id` route in `routes/users.js` that consumes it. Splitting the data-layer change from
the route-layer change makes each commit reviewable on its own — the first is "here's the new
store capability," the second is "here's how it's exposed over HTTP" — even though they land
together as one feature. This `NOTES.md` is a third, final commit.

## Review

I ran a self-review of the diff before opening the PR. It found no issues: the validation order,
the 404 response shape, and the id parsing (`Number(req.params.id)`) all mirror the existing
`GET /:id` and `POST /` routes exactly, and the three provided tests (success, not-found,
missing-field) all pass. The review also confirmed the edge cases I'd been checking for by hand —
a non-numeric id falls through to a 404 (since `getUserById` just won't find a match) rather than
crashing, and email format isn't validated because the existing `POST /` route doesn't validate it
either, so `PUT` intentionally stays consistent with that rather than introducing new behavior.
