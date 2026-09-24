# NOTES

## Plan

The plan was to add a `PUT /users/:id` route to `routes/users.js`, backed by a
new `store.updateUser(id, { name, email })` helper in `db/store.js`, following
the exact same shape as the existing `GET /users/:id` (lookup-by-id, 404 if
missing) and `POST /users` (400 if `name` or `email` is missing) handlers. No
new files or dependencies — just one route and one store function. I didn't
need to edit the plan before approving it; it already covered the route, the
store change, the validation case, and the not-found case, which matches what
`tests/update-user.test.js` checks.

## Model choice

Sonnet 5. This is a small, well-specified change against pre-written tests
with an existing pattern to mirror (`GET /users/:id`, `POST /users`) — there's
no ambiguity to reason through, so a faster mid-tier model is a good fit. I'd
reach for a larger model only if the task involved more architectural
judgment (e.g. designing the store layer from scratch).

## Commit split

One commit for the feature itself (`db/store.js` + `routes/users.js` together,
since the route is meaningless without the store helper it calls), and a
separate commit for this `NOTES.md`. I kept the test file changes out
entirely — `tests/update-user.test.js` was provided pre-written and wasn't
touched.

## What review caught

Ran a review pass on the endpoint before opening the PR. It flagged two
non-blocking points, both of which I decided not to change:

1. `Number(req.params.id)` on a non-numeric id like `/users/abc` produces
   `NaN`, and since `NaN !== NaN`, the lookup falls through to a 404 instead
   of a 400 for the malformed id. I left this as-is because it's the exact
   behavior the existing `GET /users/:id` route already has — changing it for
   `PUT` only would make the two routes inconsistent with each other.
2. The `if (!name || !email)` validation block is duplicated from the `POST`
   handler rather than factored into a shared helper. True, but the codebase
   doesn't have a validation-helper convention yet, and introducing one for a
   two-line check across two routes felt like more abstraction than the
   change warranted. Worth revisiting if a third route needs the same check.

No crash-level or test-affecting bugs were found — `npm test` was green before
and after the review.
