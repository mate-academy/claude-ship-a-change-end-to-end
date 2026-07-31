# NOTES

**Plan.** The plan (made in plan mode, approved as-is) was to add `updateUser(id, { name, email })` to `db/store.js` — find by id, return `null` if missing, otherwise mutate `name`/`email` and return the user — then add `PUT /users/:id` to `routes/users.js`, mirroring the validation `POST /users` already does (400 on missing `name`/`email`) and the not-found handling `GET /users/:id` already does (404). No changes were needed before approving; the plan matched the existing route/store pattern closely enough that I approved it directly.

**Model.** Claude Opus 5. The task is small and pattern-driven (copy the existing validate → store → respond shape), so no need for a heavier-reasoning model — the main risk was missing an edge case, which a careful review step covers better than a bigger model would.

**Commits.** Two logical commits: one for the store function (`db/store.js`), one for the route (`routes/users.js`) that depends on it — each is a complete, buildable step and reviewable on its own, matching how the two existing endpoints (`POST`, `GET /:id`) are separated by concern.

**Review.** Self-review before pushing caught one readability issue: `updateUser`'s `users.find((user) => user.id === id)` shadowed the outer `const user` it was being assigned to. It worked correctly (no temporal-dead-zone issue — the arrow function's own scope resolves before the assignment completes), but it was confusing to read, so the callback parameter was renamed to `candidate`. No functional bugs were found: invalid/non-numeric ids fall through to a clean 404 (`NaN` never matches via `===`), and validation runs before the store lookup so a bad request never touches data it doesn't need to.
