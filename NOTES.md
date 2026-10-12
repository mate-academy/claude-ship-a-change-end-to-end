# NOTES — PUT /users/:id

## Plan
The plan added an updateUser helper in db/store.js and a PUT /users/:id route in routes/users.js, following the existing patterns: 200 with the updated user, 404 if the user doesn't exist, 400 if name or email is missing or blank. Before approving, I edited it to split the work into separate commits (store first, then route) and to run the tests after each one.

## Model
I used Opus 5.5, the default. The change is small, so Sonnet would likely have been enough and cheaper; I kept Opus because I wanted a careful plan and a thorough review on my first end-to-end change.

## Commits
1. Add updateUser helper to the store — data layer only.
2. Add the PUT route — the HTTP layer, which made the update-user tests pass.
3. Review fixes — stricter id check and trimmed values.
Each commit does one thing, so a reviewer can read them in order.

## Review
The review found no bugs against the requirements, but it found two real edge cases: ids like "0x2" or "2.0" were converted to valid ids and could update the wrong user, and values were validated trimmed but saved with spaces. I fixed both in a separate commit. I left out email-format validation and a malformed-JSON handler because they are out of scope (and the latter affects the whole app). It also showed that the 404 test was passing by accident before the route existed.
