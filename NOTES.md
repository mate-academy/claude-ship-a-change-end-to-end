# Notes

## Plan
I planned in read-only plan mode before touching code. The plan was: add `updateUser` to `db/store.js` (reusing `getUserById`, returning `undefined` when the user is missing), then add `PUT /users/:id` in `routes/users.js`, then write this file. I edited the first draft before approving it: it only checked for missing fields, so I asked for full handling of invalid input (non-numeric/negative id, non-string, empty and whitespace-only values, malformed email), each with a clear 400 message. Check order is id, then body, then existence, so 404 only happens for valid input.

## Model
Sonnet 5.5. The change is small and well specified (two files, an existing pattern to copy, tests that define "done"), so the largest model was not needed. Sonnet is careful enough for the edge cases and review.

## Commits
One logical change per commit, data layer first so each commit leaves the project working. First pass: (1) the store helper, (2) the endpoint with validation and 404, (3) NOTES.md. After the review, one commit per fix that I chose to apply: move the validator to `validators/user.js` (pure refactor, no behavior change), strict id parsing, length limits, shared validation in `POST /users`, JSON error handler, and the new tests. The commits are not independent: later ones build on earlier ones (for example the route calls `updateUser`, and `routes/users.js` imports the validator), so reverting an early commit alone would break the code that depends on it. Only commits at the end of the line that nothing uses yet, such as the tests, can be reverted on their own. The point of the split is to read the history step by step and to find which change introduced a bug.

## Review
First I checked every invalid-input case by hand with a throwaway supertest script. The provided tests only cover one 400 case, so they would not have caught a regression. Then I asked for a review of the finished code and probed each suspicion by running it instead of trusting my reading.

What it found, all confirmed by running it:
- `Number()` accepted ids like `0x1`, `1e0` and `%201`, so `PUT /users/0x1` updated user 1. Fixed with a strict `parseId` (digits only), also used by `GET /users/:id`, which now answers 400 for a malformed id.
- A malformed JSON body returned an HTML error page with a stack trace. It now returns `{ error: "Invalid JSON body" }`.
- `POST /users` stored `{ name: 123, email: "nope" }`. It now uses the same validation as `PUT`.
- A 50,000 character name was accepted. Names are capped at 100 characters and emails at 254.

After opening the PR, the automated reviewer flagged one more: `validateUserInput` destructured its argument in the parameter list, so `undefined` or `null` threw a `TypeError` instead of giving a 400. I ran it before changing anything: the function did throw, but over HTTP it was not reachable on Express 4 (`express.json()` leaves `req.body` as `{}`, and a JSON `null` is rejected earlier as "Invalid JSON body"). It is still a real weakness, since Express 5 leaves `req.body` undefined, so I fixed it defensively with `body ?? {}` and wrote the unit test first to see it fail.

The new tests (`tests/user-validation.test.js`) lock these in. I checked they are not vacuous: with the id check and name limit removed on purpose, exactly the 4 related tests failed.

Reviewed and left as is, by choice: two users can share an email (the task does not ask for uniqueness), and an unknown id with an invalid body answers 400, not 404, because input is validated first. PUT replaces both fields; there is no partial update.
