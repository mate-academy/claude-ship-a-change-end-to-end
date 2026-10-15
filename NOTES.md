# Notes — PUT /users/:id

## Plan Summary

Add an "update a user" endpoint that follows the existing `GET /users/:id` and
`POST /users` conventions exactly: parse `:id` with `Number(req.params.id)`,
validate `name`/`email` the same way `POST /` does (400 with the same error
message on a missing field), return 404 with `{ error: "User not found" }`
when the id doesn't exist, and 200 with the updated user otherwise. All data
access goes through `db/store.js`, matching how the other routes never touch
the `users` array directly.

I entered plan mode before writing any code, had Claude explore
`routes/users.js`, `db/store.js`, and the pre-written
`tests/update-user.test.js` to pin down the exact contract, then reviewed and
approved the plan before implementation started.

## Implementation

- `db/store.js`: added `updateUser(id, { name, email })`, which reuses the
  same `users.find((user) => user.id === id)` lookup as `getUserById`,
  mutates the found user in place, and returns `undefined` when no user
  matches (so the route can reuse the existing `if (!user)` 404 pattern).
- `routes/users.js`: added `router.put("/:id", ...)`, validating before
  looking up the user (same order as `POST /`), so a request missing a field
  returns 400 even for a nonexistent id — which is exactly what
  `tests/update-user.test.js`'s third case expects.

## Commit Sequence

Three commits, one per concern, matching this repo's existing per-file commit
granularity (the original GET/POST endpoints were also built as separate
`Create store.js` / `Create users.js` commits):

1. `Add updateUser to store` — `db/store.js` only.
2. `Add PUT /users/:id route` — `routes/users.js` only.
3. `Add NOTES.md` — this file.

## Model

Claude Sonnet 5, used interactively through Claude Code for planning,
implementation, and review.

## Review Notes

Ran `/code-review` on the branch before pushing. It found no correctness
bugs — the NaN-id handling, validation gate, in-place mutation, and
400-before-404 ordering all check out and are consistent with the existing
GET/POST handlers. It did flag one real but low-severity issue: the
`!name || !email` validation check in the new PUT handler is copy-pasted
verbatim from the POST handler. I chose not to extract it into a shared
helper — this codebase has no validation layer anywhere (every route inlines
its own checks), so adding one for two call sites would be a new abstraction
the rest of the code doesn't use, not a fix.
