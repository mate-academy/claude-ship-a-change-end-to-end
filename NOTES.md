# Notes

## What was in the plan you approved, and did you edit anything before approving?
The plan had three parts:
1. Add an `updateUser(id, { name, email })` helper to `db/store.js`.
2. Add `PUT /users/:id` to `routes/users.js`: 400 for a missing, non-string or blank `name`/`email`, 404 for an unknown user, and 200 with the updated user otherwise.
3. Add this `NOTES.md`.

I approved OpusPlan's first proposed approach for the code. Before approving I only edited the plan's `NOTES.md` section, to record the model choice and my wording. The code approach did not change.

## Which model did you choose, and why?
I selected OpusPlan as the model. I chose opusplan to maximize plan thoroughness and execution economy. Opus 5.5 handled planning, and Sonnet 5.5 handled the implementation, commits and review.

## How did you split your commits, and why that way?
Five commits on `feature/update-user`, one logical change each:
1. `Add updateUser helper to the in-memory store`: the data layer, which depends on nothing else.
2. `Add PUT /users/:id endpoint with validation and 404`: the route, which depends on the helper.
3. `Add NOTES.md describing plan, model, commits, and review`: documentation, kept apart from the code.
4. `Validate email format on PUT /users/:id`: a follow-up from my review.
5. `Reject duplicate emails on PUT /users/:id`: a second follow-up, which adds a store helper and a new 409 status.

The last two are separate because they weren't in the original plan, so each can be reviewed or reverted on its own. The unrelated `package-lock.json` change is in none of them.

## What did your review catch — or confirm was already fine?
Already fine:
- A non-numeric id becomes `NaN`, matches no user, and returns 404.
- An empty body parses to `{}` and returns 400.
- Validation runs before the lookup, so a bad body returns 400 even for an unknown id.
- A body field named `id` is ignored, so a client can't change a user's id.

Caught and fixed:
- Any string was accepted as an email. `PUT` now checks the format (`something@something.tld`, no spaces) and returns 400.
- Two users could share an email. `PUT` now returns 409 for a duplicate, compared case-insensitively. A user can keep their own email.

Left as is:
- Ids like `0x1` and `1e0` resolve to user 1, because `Number()` accepts them. `GET /users/:id` does the same.
- Valid values are stored without trimming, as in `POST /users`.
- `POST /users` does not have the new format or duplicate checks.
