# Notes — update a user endpoint

**Plan:** add an `updateUser(id, { name, email })` helper to `db/store.js` that
looks up the user by id and returns `null` when it's missing, then wire a
`PUT /users/:id` route in `routes/users.js` that validates `name`/`email` the
same way `POST /users` does, returns 400 on a missing field, 404 when
`store.updateUser` returns `null`, and 200 with the updated user otherwise. I
approved the plan as-is — it matched the existing create/read pattern closely
enough that there was nothing to edit.

**Model:** Claude Sonnet 5, since this is a small, well-scoped CRUD endpoint
in an existing codebase — no need for a heavier model for a change this
contained.

**Commits:** split into three — the `db/store.js` helper, the `PUT /users/:id`
route that depends on it, and `NOTES.md` on its own — so each commit is a
single reviewable unit (data layer, then the HTTP layer, then the write-up),
matching how the rest of the resource was already built.

**Review:** asked for a self-review of the diff before opening the PR. It
confirmed the validation and not-found handling mirror the existing
`POST`/`GET` routes, and that a non-numeric `:id` falls through to a 404
instead of crashing (since `Number("abc")` is `NaN`, and `Array.find` on it
just returns nothing). No bugs were found that needed fixing.
