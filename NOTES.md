1. I choose opusplan for planning.

**Plan approved / edits:** Explored the codebase (routes/users.js, db/store.js,
tests/update-user.test.js) to see the existing route/validation/error patterns,
then planned adding an `updateUser` helper to `db/store.js` and a
`PUT /users/:id` route in `routes/users.js` that reuses the same validation
message and 404 shape as the existing `POST` and `GET /:id` handlers. The user
approved the plan as written but asked to work it with one commit per logical
change instead of stopping after planning.

**Model:** Opus in plan mode (opusplan), Sonnet for execution — the default
for this environment; no reason to change it for a change this small.

**Commit split:** Two commits: one for the `db/store.js` `updateUser` helper,
one for the `routes/users.js` route that calls it. Splitting store from route
keeps each commit reviewable on its own (data layer vs. HTTP layer) and
matches how the rest of the repo's history is organized (one file/concern per
commit).

**Review findings:** Ran `npm test` and `npm run lint` after each commit.
Both passed cleanly on the first try — no bugs caught, just confirmed the
validate-before-lookup ordering (400 before 404) matched what the tests
expected, and that reusing the existing error strings (`"name and email are
required"`, `"User not found"`) kept responses consistent with the rest of
the API.
