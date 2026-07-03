# Notes on the "update a user" change

**Plan.** The plan added an `updateUser(id, { name, email })` helper to
`db/store.js` (lookup-and-mutate in one call, returning `undefined` when the
id doesn't exist) and a `PUT /users/:id` route in `routes/users.js` that
validates `name`/`email` before touching the store (matching `POST /users`),
then 404s if `store.updateUser` returns nothing. I approved the plan as
written — no edits were needed since the grading tests and the existing
`GET`/`POST` handlers already pinned down the exact validation and
not-found behavior to mirror.

**Model.** Claude Sonnet 5. The feature is small and closely scoped by
existing patterns and pre-written tests, so a fast, precise model was
enough; no need for a heavier reasoning model.

**Commits.** Three commits: the store helper, the route, and this file.
Splitting store from route follows the codebase's own architectural
boundary (data access vs. HTTP handling), so each diff is understandable on
its own without needing the other for context.

**Review.** I ran a self-review pass (`/code-review`) over the full diff
before writing this file. It came back clean — no correctness bugs,
duplicated logic, or convention violations. It confirmed the validate-before-404
ordering and the reused `!name || !email` check were consistent with the
existing `POST /users` handler, and that `updateUser` never lets the request
body override a user's `id`.
