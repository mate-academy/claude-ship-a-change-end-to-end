# Notes

**Plan:** Add a `PUT /users/:id` route in `routes/users.js` plus an `updateUser(id, { name, email })`
helper in `db/store.js`, following the same shape as the existing `getUserById`/`createUser`
helpers. Validate `name` and `email` are present (400 if not, same rule as `POST /users`), look
the user up by id, return 404 if it's missing, otherwise mutate and return it. No edits needed —
the plan matched the tests in `tests/update-user.test.js` directly, so I approved it as-is.

**Model:** Claude Sonnet 5. The task is a small, well-specified CRUD endpoint with tests already
written as the spec — a fast, cheap model is enough; no need for deeper reasoning here.

**Commits:** Split into two: (1) the `updateUser` store helper on its own, since it's a
self-contained addition to the data layer, and (2) the route that uses it. Keeping them separate
makes each commit reviewable independently — the store change can be understood without the
routing concern, and vice versa.

**Review:** Self-reviewed the diff against the existing GET/POST handlers for consistency. Checked
edge cases: a non-numeric id (`Number("abc")` → `NaN`) never matches a stored user, so it falls
through to the 404 path instead of crashing; validation runs before the lookup, matching the test
that expects 400 on a missing field even when other tests target a nonexistent id. No changes were
needed — the implementation already handled these paths correctly.
