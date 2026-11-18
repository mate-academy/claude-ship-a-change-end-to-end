# Notes

**Plan.** The plan was: add an `updateUser(id, { name, email })` helper to `db/store.js` that returns `undefined` for an unknown id, then add `PUT /users/:id` in `routes/users.js` that validates the body (400), calls the store, and returns 404 when nothing was found, otherwise 200 with the updated user. I read the tests first and did not need to change the plan before approving it. Note: I did not run this session in interactive plan mode; I wrote the plan from the code and tests directly.

**Model.** Sonnet 5.5. The change is small and well specified by the tests, so the fastest capable model was enough and a larger one would add cost without benefit.

**Commits.** Three commits, one logical change each: the store helper, the route (which depends on the helper), then this write-up. Splitting data access from HTTP handling matches the existing layering and keeps each diff easy to review.

**Review.** The review confirmed that the not-found path returns 404 instead of crashing (a non-numeric id becomes `NaN`, which matches no user) and that a missing body is handled. It also led me to make validation stricter than POST: name and email must be non-empty strings, so values like `123` or whitespace are rejected with 400. Known limits, left as is: email format is not checked, and validation runs before the lookup, so an invalid body for an unknown id returns 400 rather than 404.
