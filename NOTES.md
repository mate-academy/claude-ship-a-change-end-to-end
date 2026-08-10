# Notes

## Plan

The plan was to touch two files: add an `updateUser(id, { name, email })` helper
to `db/store.js` that mirrors the existing `createUser`/`getUserById` pattern
and returns `null` when the id doesn't exist, then add a `PUT /users/:id`
route in `routes/users.js` that validates `name`/`email` (400 if either is
missing, matching the existing POST route), calls the store helper, and
returns 404 if it comes back null or 200 with the updated user otherwise. I
didn't need to edit the plan — it matched what the tests in
`tests/update-user.test.js` expect.

## Model

Used Sonnet 5 (via Claude Code). The change is small and closely follows
existing patterns in the repo (POST/GET routes, store helpers), so a
lightweight, fast model was enough — no need for a heavier reasoning model.

## Commit split

Two commits: one for the store helper (`updateUser` in `db/store.js`), one
for the route (`PUT /users/:id` in `routes/users.js`). Splitting them keeps
the data-access change and the HTTP-layer change independently reviewable —
each commit is a single logical unit and makes sense read on its own.

## Review

Self-reviewed the diff before writing this up. Checked: validation runs
before the id lookup (so a bad request returns 400 rather than leaking
whether the id exists), the not-found path returns a plain 404 without
crashing, and `updateUser` mutates and returns the existing user object
rather than replacing it (so `id` can't accidentally change). No issues
found — the implementation follows the same shape as the existing
create/read routes, so there wasn't much surface area for new bugs.