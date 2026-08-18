# Notes — update-user endpoint

**Plan.** Add `PUT /users/:id` to `routes/users.js` plus an `updateUser(id, { name, email })`
helper in `db/store.js`, mirroring the existing `getUserById`/`createUser` pattern so the
route stays thin and all data access goes through the store. Validate `name` and `email`
the same way `POST /users` already does (400 if either is missing), and return 404 when
the id doesn't exist. The plan matched the tests in `tests/update-user.test.js` directly,
so I approved it without edits.

**Model.** Claude Sonnet 5 — this is a small, well-scoped change against a codebase whose
conventions are obvious from the existing routes, so no need for a heavier model.

**Commits.** Split into two: one adding `updateUser` to `db/store.js`, one adding the
`PUT /:id` route that uses it. Each commit is a complete, reviewable unit — the store
change makes sense on its own (a new data-access helper following the existing pattern),
and the route change is easy to read against it without needing to hold both diffs in
your head at once.

**Review.** Ran a self-review (`/code-review`) before opening the PR. It came back clean:
no removed behavior or broken call sites, `Number(req.params.id)` producing `NaN` for a
non-numeric id still falls through correctly to the 404 path via `===`, and mutating the
found user in place is consistent with how the in-memory store already works. No changes
were needed.
