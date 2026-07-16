# Notes

## What was in the plan you approved, and did you edit anything before approving?

The approved plan was to add an `updateUser(id, { name, email })` helper to
`db/store.js` (mirroring the existing `getUserById`/`createUser` pattern, returning
`undefined` when the id doesn't exist) and a `PUT /users/:id` route in
`routes/users.js` that validates `name`/`email` are present (400 if not, matching
`POST /users`), then calls the store helper and returns 404 if it comes back empty,
otherwise 200 with the updated user. I didn't edit anything before approving — the
existing code already had clear patterns to follow for validation and not-found
handling, so there wasn't a design decision to second-guess.

## Which model did you choose, and why?

Sonnet. The change is small, pattern-following, and touches two files with no
architectural ambiguity — well within what Sonnet handles reliably, no need for a
heavier model.

## How did you split your commits, and why that way?

Three commits, one per concern:

1. `db/store.js` — the `updateUser` helper, so the data-layer change is reviewable
   on its own.
2. `routes/users.js` — the `PUT /users/:id` route that uses it.
3. This `NOTES.md`.

Splitting the store helper from the route keeps each commit understandable without
needing the other open — the store commit answers "how is a user updated," the
route commit answers "how is that exposed over HTTP."

## What did your review catch — or confirm was already fine?

Self-reviewed the diff for the usual edge cases: validation-before-lookup ordering,
the not-found path, and how a non-numeric `:id` (`Number("abc")` → `NaN`) is
handled. Nothing needed fixing — `NaN !== NaN` means `getUserById` correctly falls
through to "not found" for a garbage id, the same way the existing
`GET /users/:id` route already relies on. Validation matches `POST /users`'s
`!name || !email` check exactly, and the mutation approach follows `createUser`'s
in-place style. No CLAUDE.md exists in this repo to check conventions against.
