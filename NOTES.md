# NOTES

## Plan
After reading `tests/update-user.test.js`, the plan was small: add an `updateUser(id, { name, email })` helper to `db/store.js` that returns the updated user (or `undefined` if the id doesn't exist), then add `PUT /users/:id` in `routes/users.js` that uses it. The route returns 400 if `name` or `email` is missing, 404 if the user doesn't exist, and 200 with the updated user otherwise. I checked the plan against the three cases the tests expect (update, 404, 400) and it covered all of them, so I approved it without changes. This plan was written in the chat, not in Claude Code's read-only plan mode.

## Model
I worked with Claude Sonnet 5.5. The change is small and well defined by the tests, so a fast, capable general model was enough; a bigger model would not have changed the result.

## Commits
Two commits, one logical change each:
1. `Add updateUser helper to the in-memory store` (data layer).
2. `Add PUT /users/:id endpoint` (HTTP layer, validation and status codes).

Splitting them keeps the store change reviewable on its own, and each message explains the why without opening the diff. `NOTES.md` is a third, separate commit.

## Review
Before pushing I reviewed the diff for bugs and edge cases. Confirmed fine: a non-numeric id becomes `NaN`, finds no user and returns 404; validation runs before the lookup, same order as `POST /users`; the existing user object is updated in place, so `GET /users` reflects the change. Known limitation, left as is for consistency with `POST /users`: validation only checks that `name` and `email` are truthy, not that they are strings or valid emails. `npm test` and `npm run lint` pass.
