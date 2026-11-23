# NOTES - shipping `PUT /users/:id`

## The plan, and what I changed before approving
Before writing code I had Claude read `tests/update-user.test.js`, `routes/users.js` and `db/store.js` and propose a plan:
1. Add `updateUser(id, { name, email })` to `db/store.js`, returning `undefined` for an unknown id.
2. Add `PUT /users/:id` in `routes/users.js`, with a 404 for an unknown id and a 400 for a missing field.
3. Run the tests and commit.

I edited two things before approving. First, I added basic shape checks, so a non-string or blank `name`/`email` and an email without `@` also get a 400 and fields are trimmed. The plan only said "missing field", and I didn't want `"   "` or `42` saved as a name or email. Second, I made the route check that the user exists before validating the body, so an unknown id always gets a 404, whatever was sent.

## Model
I used **Opus**. The change itself is small and well specified, so Sonnet would have been enough to write it. I wanted the stronger model for the planning and the self-review, because there the job is to find edge cases the given tests don't cover. For a routine follow-up of the same size I would switch to Sonnet.

## How I split the commits
1. `Add updateUser to the store`: the data-layer helper on its own. Routes only reach data through `db/store.js`.
2. `Add PUT /users/:id to update a user`: the route and its validation. This is the commit that turns the graded tests green.
3. `Add edge-case tests for PUT /users/:id from the review`: extra tests for what the review found. They go in a separate file, so the graded test file stays untouched.
4. `Add NOTES.md`: this write-up.

Each commit is one logical change, and each message says why the change was made as well as what changed, so `git log` reads without opening the diffs.

## What the review caught, or confirmed was fine
I asked Claude to review the branch for bugs, edge cases, the not-found path and the validation. It confirmed four things were fine:
- An unknown id returns 404 and nothing is written.
- A non-numeric id (`/users/abc`) becomes `NaN`, matches nothing and returns 404 instead of crashing.
- A missing body is handled (`req.body || {}`).
- The store is only touched after validation passes, so an invalid request never half-updates a user.

It also raised three points:
- **Only blank and non-string values had been rejected, and the edge cases had no tests.** I added those tests.
- **`PUT` replaces both fields, so a partial update is a 400.** That is intentional and matches the graded test. A future `PATCH` would allow partial updates.
- **The email check is only "contains @".** That is deliberately light for an in-memory demo, not real email validation.

Result: `npm test` passes 13 of 13 (graded + edge-case + existing tests) and `npm run lint` is clean.
