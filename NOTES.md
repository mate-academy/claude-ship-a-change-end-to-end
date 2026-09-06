# NOTES

## Plan

The plan was small and mirrored the existing patterns in the repo: add an
`updateUser(id, { name, email })` helper to `db/store.js` that looks up the
user, returns `undefined` if it doesn't exist, otherwise mutates and returns
it (same shape as `getUserById`/`createUser`). Then add a `PUT /users/:id`
route in `routes/users.js` that validates `name` and `email` are present
(400 if not, matching the existing `POST /users` validation), looks the user
up via the store (404 if missing), and otherwise returns the updated user
with a 200. No edits were needed to the plan — it matched what the tests in
`tests/update-user.test.js` required.

## Model

Used Claude Sonnet 5. This is a small, well-scoped CRUD endpoint with an
existing pattern to follow (`GET`/`POST` already in the file), so a fast,
capable model was enough — no need for deeper reasoning effort.

## Commit split

Split into two commits: one for the `db/store.js` helper, one for the
`routes/users.js` route. Each is a self-contained logical unit (data layer,
then the HTTP layer that uses it), and either one reads clearly on its own
in a diff without needing the other for context.

## Review

Self-reviewed the diff after the tests went green: checked that validation
mirrors the existing `POST` endpoint (reject empty string as well as
missing fields), that a non-numeric `:id` (e.g. `/users/abc`) resolves to a
clean 404 instead of throwing, and that the route only assigns the two
expected fields onto the user rather than spreading the whole request body.
Nothing needed fixing — the implementation matched the existing conventions
in the file and all three `update-user` tests plus lint passed cleanly.
