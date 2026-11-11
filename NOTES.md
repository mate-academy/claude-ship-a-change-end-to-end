# Notes

## Plan
I accepted OpusPlan's first proposed plan without editing it. It had three parts:
1. Add an `updateUser(id, { name, email })` helper to `db/store.js` that returns `undefined` for an unknown id.
2. Add `PUT /users/:id` to `routes/users.js`. It returns 400 for a missing, non-string or blank `name`/`email`, 404 when the user doesn't exist, and otherwise 200 with the updated user.
3. Add this `NOTES.md`.

## Model
I selected OpusPlan as the model. I chose opusplan to maximize plan thoroughness and execution economy. Opus 5.5 handled planning, and Sonnet 5.5 handled the implementation, commits and review.

## Commits
Five commits on `feature/update-user`, one logical change each:
1. `Add updateUser helper to the in-memory store`: the data layer, which builds on nothing else.
2. `Add PUT /users/:id endpoint with validation and 404`: the route, which depends on the helper.
3. `Add NOTES.md describing plan, model, commits, and review`: documentation, kept apart from the code.
4. `Validate email format on PUT /users/:id`: added after the review showed `not-an-email` was accepted. It is a separate commit because it is a follow-up to the review, not part of the original plan.
5. `Reject duplicate emails on PUT /users/:id`: a second follow-up, kept apart from the format check because it adds a store helper and a new status code (409).

I left the unrelated `package-lock.json` change out of every commit.

## Review
Self-review of the diff found no bugs. These cases were already handled:
- A non-numeric id becomes `NaN`, matches no user, and returns 404.
- An empty body parses to `{}` and returns 400.
- Validation runs before the lookup, so a bad body returns 400 even for an unknown id.

The review did turn up one gap: any string was accepted as an email. I fixed it by adding a format check on `PUT` (`something@something.tld`, no spaces), which returns 400 with `email must be a valid email address`. `POST /users` does not have this check yet.

I then added a duplicate-email check on `PUT`. If another user already has the email (compared case-insensitively), it returns 409 with `email is already in use`. A user can keep their own email or change only its case. The not-found check runs first, so an unknown id still returns 404. `POST /users` does not have this check yet either.

One thing I left as it is: valid values are stored as sent, without trimming, which matches how `POST /users` behaves.
