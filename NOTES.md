# Notes

## The plan

The plan was to add `PUT /users/:id` to `routes/users.js`, backed by a new
`updateUser(id, { name, email })` helper in `db/store.js`, mirroring the
existing `createUser`/`getUserById` style exactly: validate `name` and
`email` are present (400 with the same message POST uses if not), look the
user up by id, 404 with the same "User not found" message GET/:id uses if
missing, otherwise mutate and return the updated user with a 200. No changes
to `server.js` were needed since `/users` was already mounted with JSON body
parsing enabled. I approved the plan as written — it matched the contract in
`tests/update-user.test.js` exactly, so I didn't need to edit anything
before approving.

## Model choice

Sonnet 5. The task was small and the contract was fully pinned down by the
existing tests and README, so there wasn't much ambiguity to reason through
— a fast, capable model was enough, no need to reach for a heavier one.

## Commit split

Two commits for the feature, plus this notes commit:

1. `db/store.js` — add the `updateUser` helper, in isolation.
2. `routes/users.js` — add the `PUT /:id` route that uses it.

Splitting store and route into separate commits keeps each one reviewable
on its own (data layer vs. HTTP layer), the same way the endpoint itself
was designed to keep those concerns separate.

## What review caught

I ran a code review pass after implementing the endpoint. It found no
correctness bugs — the not-found and validation paths both behave as the
tests expect. The one thing it flagged was that the `if (!name || !email)`
validation block in the new PUT handler is identical to the one already in
the POST handler a few lines above. I chose to leave it duplicated rather
than extract a shared helper: it's two lines, used in exactly two places,
and the existing codebase doesn't have a validation-helper convention to
extend — pulling it into a function would be more abstraction than two
identical lines warrant right now.
