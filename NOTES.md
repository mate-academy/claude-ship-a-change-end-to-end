# Notes

**Plan.** I planned in plan mode first. The plan was: add `updateUser(id, {name, email})` to `db/store.js` (returns the user, or `undefined` if the id is unknown, like `getUserById`), then add `PUT /users/:id` to `routes/users.js` that validates input (400), maps a missing user to 404, and otherwise returns 200 with the updated user. I did not need to edit the plan before approving it.

**Model.** Sonnet 5.5 — the change is small and well specified by the tests, so a larger model would add cost without adding value.

**Commits.** Three commits, one logical change each: the store helper, the route (which depends on the helper), and this write-up. Splitting data access from HTTP handling keeps each diff small and lets each be understood on its own.

**Review.** I checked the diff for the not-found path, validation and id parsing. Confirmed fine: an unknown, non-numeric (`abc` -> `NaN`) or fractional id all give 404, and validation runs before the lookup so a missing field gives 400. Fixed during the build: whitespace-only or non-string values are rejected and values are trimmed. Not done: email format is not validated beyond being non-empty, which is consistent with `POST /users`.
