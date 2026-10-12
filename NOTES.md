# Notes

**Plan.** I planned in plan mode first, with Claude in read-only mode, and approved the plan before any code was written. It said to add `updateUser(id, { name, email })` to `db/store.js`, returning the updated user or `undefined` for an unknown id, like `getUserById`. Then it said to add `PUT /users/:id` to `routes/users.js`. That route validates the input (400), maps a missing user to 404 and otherwise returns 200 with the updated user. The plan also covered working on a feature branch, running `npm test` after each step, reviewing before pushing, and writing these notes last. I did not edit the plan before approving it, and it already covered the files and the not-found and invalid-input cases the tests expect.

**Model.** I chose Sonnet myself. The change is small and the tests specify it exactly, so a larger model would add cost without adding much. I kept the choice with me because I wanted control over it. Opus would be the choice for a bigger or less well-specified change.

**Commits.** Five commits, one logical change each, with messages written from the diff:
1. `updateUser` in `db/store.js`, the data layer on its own.
2. `PUT /users/:id` in `routes/users.js`, which depends on the helper. Keeping data access and HTTP handling apart keeps each diff small and understandable alone.
3. `NOTES.md`, the first write-up.
4. The id fix and the extra tests, kept separate from the feature because it came from the review and is easy to review on its own.
5. `NOTES.md` updated with what the review found.

**Review.** I ran `/code-review` on the diff and checked each finding myself. It caught a real bug: `Number(req.params.id)` accepts `0x1`, `1e0`, `1.0` and `%201` as id 1, so a write could hit user 1 through several URLs. I fixed it with a strict `^\d+$` check, which also means an invalid id gives 404 whatever the body is. It also flagged thin test coverage, so I added `tests/update-user-validation.test.js` (the provided test file is untouched). Confirmed fine: unknown ids give 404, and a missing field gives 400. Left alone on purpose, because they are outside this change and are noted in the PR: `POST /users` validates less strictly than `PUT` (it accepts non-strings and does not trim), validation is not shared between the two routes, and `updateUser` mutates the stored object in place like the rest of the store. Email format is only checked for being non-empty.
