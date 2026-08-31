# Notes on the update-user endpoint

**Plan.** Add `PUT /users/:id` to `routes/users.js` and a matching `updateUser(id, { name, email })`
helper to `db/store.js`, following the exact shape of the existing `POST /users` route: validate
`name`/`email` first (400 with the same error message format), then look the user up through the
store (404 if it doesn't exist, matching `GET /users/:id`'s not-found handling), else update and
return it. No changes to `tests/update-user.test.js`.

**Model.** Sonnet for planning and execution — this was a small, well-specified change (one route,
one store helper) with an existing pattern to mirror, so there was no design ambiguity that needed
Opus's deeper reasoning; Sonnet was fast enough to plan and build in one pass.

**Commits.** Split into three logical commits: `CLAUDE.md` (workflow documentation, unrelated to
the feature itself), the `updateUser` store helper, and the route that uses it. Kept the helper and
the route separate because they're independently reviewable/testable changes — the helper has no
effect on behavior until the route calls it, so bisecting or reviewing either one in isolation makes
sense. `NOTES.md` is its own commit since it's documentation, not code.

**Review.** Self-reviewed the diff (`git diff main...HEAD`) before opening the PR. Checked: the
not-found path (non-numeric `:id` becomes `NaN`, which cleanly misses every lookup and falls
through to 404 instead of crashing), the validation path (matches `POST`'s exact error shape), and
whether extra body fields could be abused (they're ignored via destructuring, so a client can't
override `id` through the request body). Found no bugs to fix. One design choice worth noting: when
both the id is unknown and a field is missing, the route returns 400 (validates before it looks up
the user) rather than 404 — no test exercises that combination, so it was a judgment call, not
something the tests forced.
