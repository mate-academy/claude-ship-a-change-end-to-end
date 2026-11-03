# Notes

**Plan.** I planned in plan mode first: add an `updateUser` helper to `db/store.js`, then a `PUT /users/:id` route in `routes/users.js` that validates input (400), returns 404 for unknown ids and 200 with the updated user otherwise. I approved the plan without edits.

**Model.** Claude Sonnet 5.5: the change is small and follows an existing pattern, so a fast, capable model was enough.

**Commits.** Four commits: the store helper, the route, this file, and a follow-up fix after review. Each is one logical change and can be understood on its own.

**Review.** I ran `/code-review` before opening the PR. It caught two real issues, which I fixed: `Number(req.params.id)` accepts values like `1.0` and `0x1`, so `PUT /users/0x1` updated user 1 (the route now rejects non-integer ids with 400), and an earlier version of this file claimed checks that had not been run yet. It also confirmed a deliberate choice: validation runs before the existence check, so `PUT /users/9999` with an invalid body returns 400, not 404. Left as is: `POST /users` validates less strictly than `PUT` (a follow-up, since it changes `POST`), no email format/uniqueness check (outside the task), and malformed JSON returns Express's HTML error (app-wide, not specific to this route).
