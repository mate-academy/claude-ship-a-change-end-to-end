# NOTES

## The plan I approved

Add a `PUT /users/:id` endpoint that updates an existing user. The plan mirrored the
existing route/store conventions instead of introducing new patterns:

- A new `updateUser(id, { name, email })` helper in `db/store.js` that reuses
  `getUserById`, updates the record in place, and returns `undefined` when the user
  isn't found.
- A `PUT /:id` handler in `routes/users.js` that validates the body (400 on a missing
  field), calls `store.updateUser`, returns 404 when the user doesn't exist, and 200
  with the updated user otherwise.

I didn't change the approach before approving. The decisions I confirmed during planning:
validate presence only (matching `POST /users` — no email-format check), run the 400
validation before the 404 existence check, and treat `PUT` as a full replace of `name`
and `email` since both are required.

## Model

I used **Sonnet 4.6** because the change is small and fully pinned by the existing tests:
the spec was unambiguous and the implementation just mirrored existing route/store
patterns, so a fast, economical model was enough — no need to reach for a heavier one.

## Commits

Two commits. The endpoint and this write-up go together in one — the `updateUser` store
helper and the `PUT /:id` route only make sense as a unit, and the write-up ships
alongside the feature it documents. The `CLAUDE.md` repo guide is a separate commit, since
it's unrelated to the endpoint and shouldn't be bundled into the feature's history.

## What the review caught

`npm test` is green for all three update cases (200 update, 404 unknown id, 400 missing
field) and the existing tests still pass; `npm run lint` is clean. The not-found path is
explicit rather than relying on Express's fallthrough 404, and a missing field is rejected
before the store is touched. Intentionally left out and confirmed not needed: email-format
validation and a partial-update (PATCH) path.
