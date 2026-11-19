# Notes: `PUT /users/:id`

## The plan

The plan was written in plan mode after reading `routes/users.js`, `db/store.js`, `server.js` and the tests. It had three changes: an `updateUser(id, { name, email })` helper in `db/store.js`, a `PUT /:id` route in `routes/users.js` that follows the existing patterns (404 for an unknown id, 400 for bad input), and this `NOTES.md`.

It was edited before approval. Checking it against the tests turned up one gap: a request with no JSON body could make the route destructure `undefined` and return a 500 instead of a 400. A line was added to read the body as `req.body || {}`. A Model section was added too, so the choice below was recorded in the plan. Not-found is checked before body validation, so an unknown id is always a 404.

## Model

Claude Sonnet 5.5 (`claude-sonnet-5-5`). The change is small (about 30 lines across two files) and the tests were already written, so the target was unambiguous. Opus would have cost more without changing the result, and Haiku is less reliable on edge cases like validation and empty bodies, which is where the risk was in this change.

## Commits

The branch has three commits plus this notes file, each one logical change:

1. `Add updateUser helper to the in-memory store`: the data layer first, so the route had something to call. It returns `undefined` for an unknown id so the caller decides on the 404.
2. `Add PUT /users/:id endpoint to update a user`: the route, validation and error responses. This is the commit that turned the three update-user tests green.
3. `Reject malformed emails in PUT /users/:id`: a fix found during review, kept separate so the fix is visible as its own change rather than hidden inside the route commit.

`NOTES.md` is its own commit because it documents the finished work, including what the review found.

## Review

The first review ran 18 edge cases against the running app. It caught one real bug: `email: "not-an-email"` returned 200 and was saved, even though the task says invalid fields must be rejected. That was fixed with a deliberately loose check (something@something, no whitespace) in commit 3.

It confirmed these were already fine: unknown, non-numeric, negative and decimal ids return 404; missing, null, wrong-type and blank fields return 400; an empty body returns 400 instead of crashing; and an `id` in the body can't change the user's id.

A second pass with 25 more cases found no new bugs in the endpoint. Gaps left alone on purpose, because they are outside the task and the tests: duplicate emails are allowed (as in `POST`), `a@b` passes the loose email check, a zero-width-space name is accepted, and malformed JSON returns a bare 400 from Express's default handler in `server.js`.
