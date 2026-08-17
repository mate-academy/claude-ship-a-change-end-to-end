# NOTES

## Plan

Approved plan: add a `PUT /users/:id` endpoint by following the existing patterns already in the codebase rather than inventing new ones.

- `db/store.js`: add `updateUser(id, { name, email })`. It reuses `getUserById` to find the user, returns `null` if not found (letting the route decide the HTTP status, same as the existing `getUserById`/`GET /:id` split), and otherwise mutates the found user in place and returns it.
- `routes/users.js`: add `router.put("/:id", ...)`. Validates `name`/`email` with the same truthy check `POST /` already uses (400 if either is missing), calls `store.updateUser`, returns 404 if it comes back `null`, otherwise 200 with the updated user.

No edits to the plan's technical approach were needed during implementation — it matched the codebase's existing style directly. The one process correction: the first two commits were made on `main` instead of a feature branch (the assignment's process was followed but the branch step was missed). Caught this by rereading the project README, then moved both commits onto a new `update-user-endpoint` branch and reset `main` back to `origin/main` before opening the PR, so `main` stayed clean.

## Model

Claude Sonnet 5, used interactively in the same Claude Code session throughout (planning, implementation, review, PR). The change was small and pattern-matched an existing endpoint (`POST /users`) closely enough that no larger/more expensive model was needed — the main value was following the codebase's existing conventions exactly rather than open-ended design work.

## Commits

Two commits, split by logical layer rather than by file-touch count:

1. `Add updateUser helper to in-memory store` (`db/store.js`) — the data-layer change, independently testable/reviewable.
2. `Add PUT /users/:id route to update a user` (`routes/users.js`) — the HTTP-layer change that wires the helper up to validation, 404, and 200 responses.

Splitting this way means each commit is a complete, coherent unit (store logic vs. route logic) rather than an arbitrary chunk, and `npm test` was run after each to confirm progress incrementally.

## Review

Reviewed the full diff before opening the PR, focused on bugs, edge cases, the not-found path, and validation logic.

- No bugs found. The 404 path correctly handles non-numeric ids too: `Number("abc")` is `NaN`, and `NaN === NaN` is always `false` in `Array.prototype.find`, so a bad id falls through to "not found" the same way the existing `GET /:id` already does.
- The 400 check reuses `POST /`'s exact validation (`!name || !email`), so empty strings and missing fields are rejected consistently with the rest of the API.
- One deliberate design choice confirmed, not a bug: validation runs before the not-found check, so a request with a missing field against a nonexistent user returns 400, not 404. This matches what the test suite expects and keeps the validation order consistent with `POST /`.
