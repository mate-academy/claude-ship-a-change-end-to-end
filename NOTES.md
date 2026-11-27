# NOTES — update-a-user endpoint

**Plan.** Add `PUT /users/:id`. The route (`routes/users.js`) validates the id (positive integer) and the body (`name` a non-empty string, `email` a well-formed address, both trimmed). It returns 400 with a clear message on bad input, and 404 `{ error: "User not found" }` when the id is unknown. The write goes through a new `updateUser(id, { name, email })` helper in `db/store.js`, which returns `null` for an unknown id instead of throwing. The plan followed the existing GET/POST pattern and touched only the route and the store.

**Model.** Claude Haiku 5.5, chosen because the change is small, well specified by the tests, and cheap to iterate on.

**Commit split.** Nothing is committed yet. The intended split is two commits: (1) the store helper, (2) the route with validation. Each commit should be runnable on its own.

**Review.** Self-review against the not-found and invalid-input cases. Checked: unknown id returns 404 without touching data; non-numeric, zero and fractional ids return 400; blank or non-string fields return 400; whitespace is trimmed before storing. Syntax was checked on both changed files. `npm test` passes locally after a fresh `npm install`.
