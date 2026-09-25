# Notes: PUT /users/:id

## Plan
I planned the change in plan mode before writing any code. The plan I approved:
- Add an `updateUser(id, { name, email })` helper to `db/store.js`. It returns `undefined` for an unknown id, the same way `getUserById` does, and it only sets `name` and `email`, so a request body can't overwrite the `id`.
- Add `PUT /users/:id` to `routes/users.js`, following the style of the existing routes:
  - 404 if the user doesn't exist. This check runs first, and a non-numeric id also gets a 404.
  - 400 if `name` or `email` is missing, isn't a string, or is blank.
  - 200 with the updated user otherwise.
- Work on a `feat/update-user` branch and rename my `notes.md` to `NOTES.md`, because CI runs on Linux, where filenames are case-sensitive.

I approved the plan without editing it. 

## Model
I chose Opus 5.5 because planning benefits most from the strongest model: it has to read the tests and the existing code and catch edge cases before any code exists. I stayed on Opus 5.5 by execution too, but I think a cheaper model would have been enough for such a small change

## Commits
1. `Add updateUser helper to the in-memory store`: the data-layer change on its own.
2. `Add PUT /users/:id endpoint with validation and 404 handling`: the route, built on that helper.
3. `Trim name/email and validate email format on PUT /users/:id`: fixes from the review, kept separate so it's clear what the review changed.
4. `Add NOTES.md ...`: this write-up.

I split it this way so that each commit is one logical change that can be read and reverted on its own. The store helper comes first because the route depends on it.

## Review
I ran `/code-review` on the branch before pushing, and it found no bugs. It confirmed that:
- non-numeric ids get a 404;
- checking for the user before validating the body is safe with the synchronous in-memory store;
- a missing body, non-string values and whitespace-only values all get a 400;
- lint and the update-user tests pass.

It also pointed out two gaps that weren't bugs: names and emails were stored without trimming, and email format wasn't checked. I decided to fix both in a separate follow-up commit. The route now trims both fields before validating and saving them, and it returns 400 if the email doesn't look like `something@something.tld`. The email check is deliberately loose: it catches typos without rejecting unusual but valid addresses. POST still behaves the old way, since changing it was outside the scope of this change.

The only thing that would have failed CI was this file, which was missing and too short.
