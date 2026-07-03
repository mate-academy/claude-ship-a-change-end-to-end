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

**Commits.** Four commits: the store helper, the route, this file, and a
follow-up fix from review. Splitting store from route follows the
codebase's own architectural boundary (data access vs. HTTP handling), so
each diff is understandable on its own without needing the other for
context.

**Review.** A first self-review pass (`/code-review`) came back clean —
no correctness bugs, duplicated logic, or convention violations. It
confirmed the validate-before-404 ordering and the reused `!name || !email`
check were consistent with `POST /users`, and that `updateUser` never lets
the request body override a user's `id`. A second, more targeted pass
focused on the not-found path and validation edge cases and found a real
gap: the truthy-only check accepted non-string `name`/`email` values (e.g.
numbers or booleans), which would get written into the store and violate
the `{id, name: string, email: string}` shape. Same gap exists in the
pre-existing `POST /users` handler, so it isn't a new regression, but it
was fixed on the `PUT` route with an explicit `typeof` check, since the
README asks to reject "invalid" fields, not just missing ones.
