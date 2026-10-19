# NOTES

## The plan I approved
Add `PUT /users/:id` in three small pieces: an `updateUser(id, { name, email })` helper in `db/store.js`, a route in `routes/users.js` that validates the body and calls the helper, and this `NOTES.md`. The route checks the body first (400), then looks the user up (404), so a bad request never touches the store. Validation requires `name` and `email` to be non-empty strings, and `email` to look like an address.

<!-- EDIT: say whether you changed anything in the plan before approving it. As drafted, it was approved as written. -->

## Model choice
<!-- EDIT: state which model you picked and why. This session planned on Opus 5.5 and built on Sonnet 5.5. -->
Planning is where a wrong assumption costs the most, so I wanted the stronger model there. The change itself is small and well specified by `tests/update-user.test.js`, so a faster model was enough for implementation.

## Commit split
1. `Add updateUser helper to the in-memory store`: the data-access change on its own, so it can be read and reverted independently.
2. `Add PUT /users/:id with validation and 404 handling`: the HTTP behaviour (validation, 400, 404, 200) that depends on the helper.
3. `Add NOTES.md`: documentation kept apart from code changes.

I split along the existing layering (store, then route), which keeps each commit small and lets each message stand without the diff.

## What review caught
I ran `/code-review` on the branch and checked each of its six findings against the code instead of taking them at face value.

- **Fixed:** `EMAIL_PATTERN` was declared mid-file after the existing routes, so I moved it to the top. I also dropped the `|| {}` guard on `req.body` in PUT.
- **Claimed a bug, but it wasn't:** the review said `POST /users` with no body would throw a 500. I tested it and it returns 400, because Express 4.22.2 sets `req.body` to `{}`. That also made my `|| {}` guard unnecessary.
- **Real, left as is:** POST and PUT validate differently (POST accepts `"not-an-email"` and untrimmed values). POST is outside this change, so I left it. A shared validation helper would be the follow-up. A bad body on an unknown id returns 400 rather than 404. That is the order I planned (validate, then look up), and both orders pass the tests.
- **Not real:** extra body fields are silently ignored, the store mutates records in place, and there is no email uniqueness check. `POST` and the existing store helpers behave the same way.

I also checked by hand that a bad email, a blank or non-string name, an empty body and no body all return 400, that `/users/abc` and unknown ids return 404, and that sending `id` in the body does not change the user's id.
