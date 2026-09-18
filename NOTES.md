# NOTES

## Plan

The approved plan was to add a `PUT /users/:id` endpoint by mirroring two
patterns already in the codebase: `GET /users/:id`'s not-found handling and
`POST /users`'s input validation. Concretely, that meant adding an
`updateUser(id, { name, email })` function to `db/store.js` that mutates the
matching user in place and returns `undefined` when the id isn't found
(matching `getUserById`'s contract), and a `router.put("/:id", ...)` handler
in `routes/users.js` that validates the body first (400 on a missing field),
then looks up/updates the user (404 if missing), and returns the updated
user on success. I approved the plan as written — no changes were needed
before approving, since it followed the existing code exactly rather than
introducing new conventions.

## Model choice

Claude Sonnet 5. The feature is a small, well-specified CRUD endpoint with
an existing pattern to copy (validation shape from `POST /`, not-found shape
from `GET /:id`), a pre-written test contract, and no architectural
ambiguity — it didn't call for a heavier-reasoning model, just careful
pattern-matching and attention to edge cases (NaN ids, spoofed `id` in the
body, empty-string fields).

## Commit split

Four commits, one logical change each:

1. `db/store.js` — add `updateUser`.
2. `routes/users.js` — add the `PUT /:id` route (this is the commit where
   `tests/update-user.test.js` turns green).
3. `routes/users.js` — extract a shared `hasValidUserFields` helper (see
   Review below), keeping validation logic in one place instead of two.
4. This file.

Splitting the refactor out as its own commit (rather than folding it into
commit 2) keeps each commit's diff explainable on its own: commit 2 is "add
the endpoint," commit 3 is "clean up duplication the endpoint introduced."

## Review

Self-review via `/code-review` caught one real issue: `POST /` and
`PUT /:id` had byte-for-byte identical `if (!name || !email)` validation
blocks. Not a bug, but a maintenance risk — if validation rules changed
later (e.g. trimming whitespace, checking email format), it would be easy to
update one handler and forget the other, leaving create and update silently
inconsistent. Fixed by extracting `hasValidUserFields`.

The review also confirmed several things were already handled correctly and
needed no changes:
- A non-numeric `:id` (e.g. `/users/abc`) safely falls through to a 404,
  since `Number("abc")` is `NaN` and `NaN === NaN` is `false` in
  `Array.prototype.find`.
- A spoofed `id` in the request body can't overwrite the real id, since both
  the route and `updateUser` only ever read `name`/`email` off the body.
- Empty-string `name`/`email` are caught by the same falsy check as
  `POST /`.
