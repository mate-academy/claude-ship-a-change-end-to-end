# Notes

**Plan.** I planned in plan mode first. The plan was: add `updateUser(id, {name, email})` to `db/store.js` (returns the user, or `undefined` if the id is unknown, like `getUserById`), then add `PUT /users/:id` to `routes/users.js` that validates input (400), maps a missing user to 404, and otherwise returns 200 with the updated user. I did not need to edit the plan before approving it.

**Model.** Sonnet 5.5 — the change is small and well specified by the tests, so a larger model would add cost without adding value.

**Commits.** Three commits, one logical change each: the store helper, the route (which depends on the helper), and this write-up. Splitting data access from HTTP handling keeps each diff small and lets each be understood on its own.

**Review.** I ran `/code-review` on the diff and checked each finding myself. It caught a real bug: `Number(req.params.id)` accepts `0x1`, `1e0`, `1.0` and `%201` as id 1, so a write could hit user 1 through several URLs. I fixed it with a strict `^\d+$` check, which also means an invalid id gives 404 whatever the body is. It also flagged thin test coverage, so I added `tests/update-user-validation.test.js` (the provided test file is untouched), and it showed that an earlier version of these notes overstated what had been verified. Confirmed fine: unknown ids give 404, and a missing field gives 400. Left alone on purpose: `POST /users` validates less strictly than `PUT` (it accepts non-strings and does not trim), validation is not shared between the two routes, and `updateUser` mutates the stored object in place like the rest of the store. These are outside this change and are noted in the PR. Email format is only checked for being non-empty.
