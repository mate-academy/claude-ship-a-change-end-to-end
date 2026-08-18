# NOTES

## Plan

Ran `npm test` first to see the update-user tests fail (red) and read `tests/update-user.test.js`
to see exactly what was required: `PUT /users/:id` should update a user (200), return 404 for an
unknown id, and 400 when `name` or `email` is missing. The plan was to follow the existing pattern
in the repo exactly:

- add an `updateUser(id, { name, email })` helper to `db/store.js`, mirroring the shape of the
  existing `getUserById`/`createUser` helpers
- add a `PUT /:id` route in `routes/users.js` that validates `name`/`email` the same way
  `POST /` already does, then calls the store helper and returns 404 if it comes back empty

No changes were needed to the plan before implementing — the existing GET/POST routes and the
tests were specific enough that the shape of the change was clear up front.

## Model

Built with Claude Sonnet 5. The endpoint is a small, well-specified CRUD addition with an existing
pattern to follow and tests already written, so a faster model was a good fit rather than needing
deeper reasoning.

## Commits

Kept it to one commit for the feature: the store helper and the route change are two halves of the
same logical change (a route with nothing to call, or a helper nothing calls, isn't useful on its
own), so splitting them would have just added noise without a meaningful intermediate state. This
`NOTES.md` is a separate commit since it's a distinct, unrelated piece of the deliverable.

## Review

Asked Claude to review the diff before pushing. It confirmed a few things were already fine:

- **Validation order**: the 400 check (missing `name`/`email`) runs before the 404 lookup, matching
  what `tests/update-user.test.js` expects (id `1` exists, but a missing field still returns 400,
  not a lookup result).
- **Not-found path**: `store.updateUser` returns `null` when the id doesn't exist instead of
  throwing, so the route can return a clean 404 rather than crashing.
- **Non-numeric id**: `Number(req.params.id)` on something like `/users/abc` produces `NaN`, which
  won't match any user and falls through to 404 — consistent with how `GET /users/:id` already
  handles the same case, so this isn't a new edge case introduced by this change.

It also caught one real thing: the `if (!name || !email)` validation was copy-pasted from
`POST /` into the new `PUT /:id` handler instead of being shared, so the two checks would silently
drift apart if the rule ever changed. Fixed by extracting a small `hasRequiredFields` helper in
`routes/users.js` that both routes call. `npm test` and `npm run lint` stayed clean after the fix.