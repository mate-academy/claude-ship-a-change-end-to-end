# Notes

## Plan

I planned the change before touching code: add an `updateUser(id, { name, email })`
helper to `db/store.js` that mirrors the existing `getUserById`/`createUser`
patterns and returns `null` on a miss, then add a `PUT /users/:id` route in
`routes/users.js` that reuses the same validation (`!name || !email` → 400)
and 404 shape (`{ error: "User not found" }`) as the existing routes, for
consistency. I approved the plan as drafted — the only thing I added on top
was creating a dedicated feature branch before committing, since the repo's
workflow ships changes via a branch + PR rather than committing on `main`.

## Model

I used Claude Sonnet 5. This is a small, well-scoped feature with tests
already written and an existing pattern to follow, so a fast, pattern-
matching model was the right fit — no need for a heavier reasoning model.

## Commit split

Four commits, in this order:

1. `chore: migrate eslint config to flat config format` — unrelated,
   already-pending work from an earlier `npm audit fix --force`, landed
   first and separately so it doesn't get mixed into the feature diff.
2. `feat(store): add updateUser helper` — the data-layer change alone.
3. `feat(routes): add PUT /users/:id endpoint` — the route alone.
4. `docs: add NOTES.md` — this write-up.

Splitting the store helper from the route keeps each commit reviewable on
its own layer, and keeping the eslint chore separate means a reviewer isn't
looking at config churn while reviewing the actual feature.

## What review caught

I ran a manual edge-case pass after the tests went green: a non-numeric id
(`/users/abc`) correctly falls through to a 404 without throwing, since
`Number("abc")` is `NaN` and `Array.find` never matches it. I also checked
that a client can't overwrite a user's `id` by including one in the request
body — the route only destructures `name`/`email` from `req.body`, so an
`id` field is silently ignored. Both were already correct; nothing needed
fixing, but they were worth verifying explicitly since neither is covered
by the provided test file.
