# Notes

## Plan
I planned in plan mode before editing anything. The approved plan was:
- add `updateUser(id, { name, email })` to `db/store.js`
- add `PUT /users/:id` to `routes/users.js`, returning 400 for invalid input, 404 for an unknown user and 200 with the updated user otherwise
- write this file

I did not edit the plan before approving it.

## Model
I used Claude Sonnet 5.5. The change is small and the tests define exactly what is needed, so a larger model wasn't necessary.

## Commits
Three commits on `feat/update-user`:
1. the store helper and route together, because the route doesn't work without the helper
2. a follow-up fix from the review, kept separate so the review's effect is visible in the history
3. this file, as documentation only

## Review
The review made six findings. I fixed one: validation trimmed `name` and `email`, but the untrimmed values were stored. I left the others alone:
- validation runs before the 404 lookup; the tests accept either order
- `PUT` is stricter than `POST` on the same fields; changing `POST` is outside this change
- non-numeric ids return 404, the same as `GET /users/:id`
- the store mutates the user in place, as it already does for the in-memory data
