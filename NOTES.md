# Notes: update a user (`PUT /users/:id`)

## The plan

The plan touched three things. First, a new `updateUser(id, { name, email })` helper in `db/store.js`, written like the existing `getUserById` and `createUser`, returning `undefined` for an unknown id. Second, a `PUT /users/:id` route in `routes/users.js` that answers 404 when the user does not exist, then validates the body (`name` and `email` must be non-empty strings and `email` must look like an address) and answers 400 with a clear message, and only then updates through the store and returns the user. Third, this `NOTES.md`. Both cases the tests expect (404 for an unknown id, 400 for a missing field) were in the plan from the start, so it did not need editing; the one change of order came later, from the review (see below).

## Model

Claude Sonnet 5.5. The change is small and well specified: two files, an existing pattern to copy, and tests that spell out the expected behaviour. A mid-size model handles that comfortably, and a larger one would cost more without a clear gain here.

## Commits

Three commits, one logical change each: (1) `Add updateUser to the data store`, the helper alone, which does not depend on anything else; (2) `Add PUT /users/:id with validation and 404`, the route that uses it, which is the commit where the update-user tests turn green; (3) `Add NOTES.md`, kept separate so a reviewer can skip it. Splitting the store from the route means each message makes sense without opening the diff, and the route can be reverted without losing the helper.

## Review

I checked the three scenarios from `tests/update-user.test.js` plus extra edge cases (bad email, blank name, no body at all, a non-numeric id, and that invalid input does not change stored data), then had the change reviewed separately. It found no blocking bugs and confirmed the store helper and the 404 path. It raised two things I fixed: validation ran before the lookup, so a bad body sent to an unknown id returned 400 instead of 404, so the existence check now comes first; and the validation helper sat in the middle of the file, so it moved to the top. Three points I left alone on purpose: the id is parsed with `Number()` exactly like `GET /users/:id`; `POST /users` still has the older, weaker validation (a follow-up, outside this change); and the email pattern is deliberately simple (it accepts `a@b..c`).
