# NOTES

## The plan
Add a `PUT /users/:id` endpoint that updates an existing user, going through the
`db/store.js` data layer like every other route. The plan was to add an
`updateUser(id, { name, email })` helper to the store and a `PUT /:id` handler to
`routes/users.js`. I kept the plan as-is — the one decision I pinned down before
approving was the order of checks: validate the body first (400 on a missing
field), then look up the user (404 if absent), so a malformed request is rejected
regardless of whether the id exists.

## Model choice
Opus 4.8 (1M context). The change is small but spans the route and store layers
and has to match existing conventions exactly (error shapes, id parsing), so I
wanted a model strong at following established patterns and reasoning about the
validate-vs-lookup ordering. For a feature this size, a smaller model would also
work; I leaned to Opus for the careful edge-case handling.

## Commit split
One logical change per commit: (1) the `updateUser` store helper, (2) the
`PUT /users/:id` route that consumes it, (3) this `NOTES.md`. Store before route
because the route depends on the helper, so each commit builds and reads cleanly
on its own.

## What the review caught
The first `npm test` run failed with `Cannot find module 'supertest'` — an
environment issue (deps not installed), not a code bug; `npm install` fixed it and
the update-user tests went green. The review confirmed the implementation reuses
`getUserById` (which returns the live array reference, so the update mutates in
place) and reuses the exact 400/404 error messages already used by the POST and
GET routes, keeping the API responses consistent.
