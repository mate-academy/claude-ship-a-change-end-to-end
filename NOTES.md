# Notes: update a user (`PUT /users/:id`)

## The plan I approved
I planned in plan mode first (read-only) and read `tests/update-user.test.js` before writing any code. The plan was a `updateUser` helper in `db/store.js`, then a `PUT /:id` route in `routes/users.js` that validates the body, looks the user up through the store, and returns 200, 400 or 404. It also ordered the checks so validation runs before the lookup, because the 400 test sends a bad body to `/users/1`.

I edited the plan once before approving. My first version had `updateUser` return `undefined` for an unknown id. I changed it to return a `"user not found"` string, exported as the `USER_NOT_FOUND` constant. The route compares against that constant, because a plain `if (!result)` check would treat the string as a found user.

## Model choice
Planning ran on Opus 5.5. That was the default for plan mode, and I chose to keep it rather than change it, because planning and edge-case thinking benefit from the stronger model. After I approved the plan, the session moved to Sonnet 5.5 for the implementation, which was a good fit because the change is small and the plan was already specific.

## Commit split
1. `db/store.js`: the `updateUser` helper and the `USER_NOT_FOUND` constant.
2. `routes/users.js`: the endpoint, its validation and the 404 handling.
3. `NOTES.md`: this write-up.

The store change and the route change are separate logical changes, and each can be reviewed and reverted on its own. The NOTES commit comes last because it describes what the review found.

I didn't split the commits any further because the changes I wanted were simple. Each file got one commit, and the validation and the 404 handling stayed together in the route commit.

## What the review found
I reviewed the diff and probed the endpoint with edge cases. It confirmed these were already fine:
- a missing body, non-string fields and whitespace-only names all return 400
- a malformed email returns 400 with its own message
- a non-numeric or fractional id returns 404 rather than crashing
- names and emails are trimmed before they are stored

My review also caught a simple output problem: returning `undefined` as the answer for a missing user. It made more sense to return "user not found" instead, which is what the final code does.

It found nothing else in my change that needed fixing. One thing I left alone: a malformed JSON body gets a 400 with an empty body from Express's default error handler. That already happens on `POST /users`, so it is outside this change.
