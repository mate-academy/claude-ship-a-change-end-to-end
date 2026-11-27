# NOTES: PUT /users/:id

**Plan.** I approved a plan with six steps: branch, store helper, route, NOTES, self-review, then push and PR. It touches only `db/store.js`, `routes/users.js` and `NOTES.md`. I did edit the plan before approving: my first draft was rejected and rewritten in a different form, but the steps and files stayed the same.

**Model.** I used Sonnet. This is a small, well-specified change with three tests already written, so a larger model would add cost without adding value.

**Commit split.** Two code commits, one per layer. The first adds `updateUser` to `db/store.js`, so data access lives in the store as the other routes do. The second adds `PUT /users/:id` in `routes/users.js`, which validates input, calls the store and maps "not found" to 404. Splitting by layer means each commit is reviewable on its own and the store change can be read without the HTTP details.

**Review.** I checked edge cases with a throwaway script: non-numeric id (404), blank or non-string name/email (400), empty body (400), whitespace trimmed on success, and an `id` in the body ignored. Nothing needed fixing. One behaviour is deliberate: validation runs before the lookup, so an empty body sent to an unknown id returns 400, not 404.
