# Notes

## What was in the plan you approved, and did you edit anything before approving?

The plan was to add `PUT /users/:id` to the users resource: update an
existing user's `name` and `email`, returning 200 with the updated user on
success, 400 if either field is missing, and 404 if the id doesn't exist.
It followed the existing conventions exactly — the not-found shape from
`GET /:id` (`{ error: "User not found" }`) and the validation shape from
`POST /` (`{ error: "name and email are required" }`) — plus a new
`updateUser` helper in `db/store.js` mirroring `getUserById`'s
find-and-return-`undefined`-if-missing pattern. Input is validated before
the id lookup, matching `POST /`'s order, so every body-consuming handler
checks its input the same way. I approved the plan as proposed without
edits — it matched the existing code style closely enough that there was
nothing to push back on.

## Which model did you choose, and why?

Sonnet (Claude Sonnet 5) for execution — planning and implementation. It's
a small, well-scoped change with an unambiguous test contract already
written, so a faster model was enough; nothing about it needed
deeper/slower reasoning.

## How did you split your commits, and why that way?

Four commits, each a single reviewable change:

1. `Add NOTES.md` — the plan/model/commit-split write-up, written before
   touching code.
2. `Add updateUser helper to the store` — the data-layer change.
3. `Add PUT /users/:id endpoint` — the route that uses it.
4. `Reuse getUserById inside updateUser` — a follow-up fix from review.

Splitting the store helper from the route keeps the data-access change
(commit 2) reviewable independently from the HTTP layer (commit 3), even
though both are needed together for the feature to work end to end. The
review fix (commit 4) is separate rather than folded into commit 2 so the
history shows what review actually caught, instead of hiding it inside
the original commit.

## What did your review catch — or confirm was already fine?

Review caught one real issue: `updateUser` re-implemented the exact same
lookup expression as `getUserById` (`users.find((user) => user.id ===
id)`) instead of calling it. Harmless today, but if lookup semantics ever
changed — a different storage structure, id-type coercion, soft-delete
filtering — a maintainer could fix `getUserById` and miss the duplicate
in `updateUser`, leaving it silently out of sync. Fixed by having
`updateUser` call `getUserById(id)` directly.

Review confirmed the rest was fine: the 404 path (`NaN` from a
non-numeric `:id` never matches via `.find`, so it falls through safely
with no crash), the 400 path (reuses `POST /`'s exact validation check),
and the 200 path (mutates and returns the existing record, matching what
the test asserts on the response body).
