# Notes — "update a user" endpoint

## The plan

Add `PUT /users/:id` to the users resource, backed by a new `updateUser`
helper in `db/store.js`. The route parses the id, validates that `name` and
`email` are present (returning 400 if not), asks the store to update the
record, and returns 404 when the store reports no such user. On success it
returns the updated user as JSON with a 200.

I kept the plan deliberately close to the existing code: the validation
check mirrors `POST /users`, and the not-found handling mirrors
`GET /users/:id`. I didn't change the plan before approving it — the only
open question was whether validation or the existence check should come
first, and I settled on validating input first so a malformed request is
rejected the same way regardless of whether the id exists.

## Model choice

Claude Sonnet 5. The change is small and the pattern to follow is already
in the file, so this is squarely in Sonnet's wheelhouse — no need for a
heavier model, and Sonnet keeps the iteration loop fast.

## Commit split

Three logical commits:

1. `updateUser` helper in `db/store.js` — the data-access change on its own,
   following the existing store helpers.
2. `PUT /users/:id` route — the endpoint that uses the helper.
3. This `NOTES.md`.

Splitting the store change from the route keeps each commit reviewable in
isolation and makes it clear the route never touches the data array
directly.

## What the review caught

- Non-numeric ids (`/users/abc`) resolve to `NaN`, which never matches a
  stored id, so they fall through to the 404 path rather than crashing —
  confirmed fine.
- A completely missing body is parsed as `{}` by `express.json()`, so the
  destructure yields `undefined` and the 400 check catches it — confirmed
  fine.
- `updateUser` mutates the stored object in place. That matches the
  existing in-memory store's approach (data resets on restart), so no
  change needed.
- `PUT` requires both fields, i.e. a full replacement — the right semantics
  for `PUT` rather than `PATCH`.

`npm test` is green and `npm run lint` is clean.
