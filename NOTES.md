# Notes: PUT /users/:id

## Plan
Planned in plan mode (read-only) before any edits. The approved plan had three parts:
a `updateUser(id, { name, email })` helper in `db/store.js` that returns `undefined`
for an unknown id; a `PUT /:id` route in `routes/users.js` that validates first (400),
then looks up the user (404), then returns 200 with the updated user; and this file.
I did not change the plan before approving it. I confirmed the defaults: validate
before lookup, an unparseable id such as `/users/abc` falls through to 404 like GET,
no email-format check, and POST left unchanged to keep the PR scoped.

## Model
Claude Sonnet 5.5. The change is small and well specified by the tests, so a fast
mid-size model was enough; a larger model would add cost without changing the result.

## Commits
1. `Add updateUser helper to the in-memory store`: the data layer on its own.
2. `Add PUT /users/:id with validation and 404 handling`: the route, which depends on the helper.
3. `Add NOTES.md`: documentation, kept separate from the code.

One logical change per commit, so each can be read and reverted independently.

## Review
`npm test` and `npm run lint` pass. I also probed edge cases by hand: non-string
name (400), whitespace-only name (400), empty body (400), missing email on an unknown
id (400, since validation runs first), unknown id (404), non-numeric id (404), and
surrounding whitespace in values (trimmed, 200). Nothing needed fixing. Known and
left alone: malformed JSON gets Express's default 400 response (already true for
POST), and duplicate emails are not rejected because the spec does not ask for it.
